import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  CssBaseline,
  IconButton,
  PaletteMode,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TitleBar, { TITLE_BAR_HEIGHT } from '../components/TitleBar';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';
import QueueList from '../components/SongsQueue';
import {
  emptySongProps,
  SongProps,
  SongDialogProvider,
  SongDialog,
  useSongsStatus,
  SongsStatusProvider,
} from '../components/Song';
import SongList from '../components/SongList';
import {
  SongUploadButton,
  SongStagingDialog,
  SongStagingDialogProvider,
} from '../components/SongUpload';
import {
  AlertMessageProvider,
  useAlertMessage,
  AlertMessage,
} from '../components/AlertMessage';
import { AudioStatusProvider } from '../components/AudioStatus.context';
import AudioPlayer from '../components/AudioPlayer';
import Microphone from '../components/Microphone';
import HelpMenuButton from '../components/HelpMenu';
import LyricsPlayer, { LyricsProvider } from '../components/LyricsPlayer';
import './App.css';
import {
  ConfirmationDialog,
  ConfirmationProvider,
} from '../components/ConfirmationDialog';
import SettingsMenu, { GetColorTheme } from '../components/Settings';
import PitchGraph from '../components/PitchGraph';

const MainPage = () => {
  const [openSong, setOpenSong] = useState<SongProps>(emptySongProps);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [uploadedSongs, setUploadedSongs] = useState<SongProps[]>([]);
  const { songsStatus, setSongsStatus } = useSongsStatus();
  const [songInProcess, setSongInProcess] = useState<string | null>(null);
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    const processSongUnsubscribe = window.electron.preprocess.processResult(
      ({ vocalsPath, accompanimentPath, graphPath, songId, error }) => {
        if (!error) {
          const songProcessedSuccessfully =
            window.electron.store.songs.getSong(songId);
          const changedSong = {
            ...songProcessedSuccessfully,
            vocalsPath,
            accompanimentPath,
            graphPath,
          };
          window.electron.store.songs.setSong(changedSong);
          setAlertMessage({
            message: `${songProcessedSuccessfully.songName} successfully processed`,
            severity: 'success',
          });
        } else {
          setAlertMessage({
            message: error.message,
            severity: 'error',
          });
        }
        setSongsStatus((state) => state.slice(1));
      }
    );

    return () => {
      processSongUnsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (songsStatus.length === 0 && songInProcess) {
      setSongInProcess(null);
    } else if (
      songsStatus.length !== 0 &&
      (!songInProcess || songInProcess !== songsStatus[0])
    ) {
      const nextSongId = songsStatus[0];
      const toProcess = window.electron.store.songs.getSong(nextSongId);
      setSongInProcess(nextSongId);
      window.electron.preprocess.processSong(toProcess);
    }
  }, [songInProcess, songsStatus]);

  return (
    <Container>
      <CssBaseline enableColorScheme />
      <TitleBar />
      <ConfirmationProvider>
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: '130px',
            top: TITLE_BAR_HEIGHT,
          }}
        >
          <AlertMessage />
          <SongStagingDialogProvider>
            <SongDialogProvider>
              <SongDialog song={openSong} setSong={setOpenSong} />
              <SongStagingDialog
                uploadedSongs={uploadedSongs}
                setUploadedSongs={setUploadedSongs}
              />
              <LeftSidebar>
                <Typography variant="h5" align="center" pt="15px">
                  Songs Library
                </Typography>
                <SongUploadButton setUploadedSongs={setUploadedSongs} />
                <SongList setOpenSong={setOpenSong} />
              </LeftSidebar>
            </SongDialogProvider>
          </SongStagingDialogProvider>
          <Container
            key="mainDisplay"
            disableGutters
            maxWidth={false}
            sx={{
              position: 'absolute',
              left: '330px',
              right: '330px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: 'auto',
              height: '100%',
            }}
          >
            <Container
              maxWidth={false}
              disableGutters
              sx={{ position: 'relative', height: '60%' }}
            >
              <PitchGraph />
            </Container>
            <Container sx={{ position: 'absolute', bottom: 0 }}>
              <LyricsPlayer />
            </Container>
          </Container>
          <RightSidebar>
            <QueueList />
          </RightSidebar>
        </Container>
        <Container
          maxWidth={false}
          sx={{
            bgcolor: GetColorTheme().audioPlayerBackground,
            height: '130px',
            position: 'fixed',
            left: 0,
            bottom: 0,
          }}
        >
          <AudioPlayer />
        </Container>
        <Stack
          direction="row"
          spacing={-1}
          sx={{ position: 'fixed', bottom: 10, left: 20, p: 0 }}
        >
          <Tooltip title="Settings">
            <IconButton
              data-testid="settings-button"
              onClick={() => setShowSettings(true)}
            >
              <SettingsIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Microphone />
          <HelpMenuButton />
        </Stack>
        <SettingsMenu
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
        <ConfirmationDialog />
      </ConfirmationProvider>
    </Container>
  );
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(GetColorTheme());
  useEffect(() => {
    const settingsUnsubscribe = window.electron.store.config.onSettingsChange(
      () => setCurrentTheme(GetColorTheme())
    );
    return () => settingsUnsubscribe();
  });

  const chosenTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: currentTheme.mode as PaletteMode,
          primary: {
            main: currentTheme.primary,
          },
          secondary: {
            main: currentTheme.secondary,
          },
          background: {
            default: currentTheme.mainPageBackground,
            paper: currentTheme.paperBackground,
          },
          divider: currentTheme.secondary,
        },
        typography: {
          button: {
            textTransform: 'none',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: `${currentTheme.scrollbarThumb} ${currentTheme.scrollbarTrack}`,
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  backgroundColor: currentTheme.scrollbarTrack,
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  backgroundColor: currentTheme.scrollbarThumb,
                  border: `2px solid ${currentTheme.scrollbarTrack}`,
                },
                '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
                  {
                    backgroundColor: currentTheme.scrollbarHover,
                  },
                '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus':
                  {
                    backgroundColor: currentTheme.scrollbarHover,
                  },
                '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active':
                  {
                    backgroundColor: currentTheme.scrollbarActive,
                  },
              },
            },
          },
        },
      }),
    [currentTheme]
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ThemeProvider theme={chosenTheme}>
              <AlertMessageProvider>
                <SongsStatusProvider>
                  <AudioStatusProvider>
                    <LyricsProvider>
                      <MainPage />
                    </LyricsProvider>
                  </AudioStatusProvider>
                </SongsStatusProvider>
              </AlertMessageProvider>
            </ThemeProvider>
          }
        />
      </Routes>
    </Router>
  );
}
