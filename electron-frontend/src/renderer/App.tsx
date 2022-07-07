import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Container,
  CssBaseline,
  IconButton,
  PaletteMode,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
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
import LyricsPlayer, { LyricsProvider } from '../components/LyricsPlayer';
import './App.css';
import {
  ConfirmationDialog,
  ConfirmationProvider,
} from '../components/ConfirmationDialog';
import SettingsMenu, {
  ColorThemeProps,
  GetColorTheme,
} from '../components/Settings';
import PitchGraph from '../components/PitchGraph';

const MainPage = ({
  setCurrentTheme,
}: {
  setCurrentTheme: Dispatch<SetStateAction<ColorThemeProps>>;
}) => {
  const [openSong, setOpenSong] = useState<SongProps>(emptySongProps);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [uploadedSongs, setUploadedSongs] = useState<SongProps[]>([]);
  const { songsStatus, setSongsStatus } = useSongsStatus();
  const [songInSpleeter, setSongInSpleeter] = useState<string | null>(null);
  const { setAlertMessage, setShowAlertMessage } = useAlertMessage();

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
          setShowAlertMessage(true);
        } else {
          setAlertMessage({
            message: error.message,
            severity: 'error',
          });
          setShowAlertMessage(true);
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
    if (songsStatus.length === 0 && songInSpleeter) {
      setSongInSpleeter(null);
    } else if (
      songsStatus.length !== 0 &&
      (!songInSpleeter || songInSpleeter !== songsStatus[0])
    ) {
      const nextSongId = songsStatus[0];
      const toProcess = window.electron.store.songs.getSong(nextSongId);
      setSongInSpleeter(nextSongId);
      window.electron.preprocess.processSong(toProcess);
    }
  }, [songInSpleeter, songsStatus]);

  return (
    <Container>
      <CssBaseline enableColorScheme />
      <Container
        maxWidth={false}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: '130px',
        }}
      >
        <AlertMessage />
        <ConfirmationProvider>
          <SongStagingDialogProvider>
            <SongDialogProvider>
              <SongDialog song={openSong} setSong={setOpenSong} />
              <SongStagingDialog
                uploadedSongs={uploadedSongs}
                setUploadedSongs={setUploadedSongs}
              />
              <ConfirmationDialog />
              <LeftSidebar>
                <Typography variant="h5" align="center" paddingTop="15px">
                  Songs Library
                </Typography>
                <SongUploadButton setUploadedSongs={setUploadedSongs} />
                <SongList setOpenSong={setOpenSong} />
              </LeftSidebar>
            </SongDialogProvider>
          </SongStagingDialogProvider>
        </ConfirmationProvider>
        <Grid container direction="column" sx={{ position: 'relative' }}>
          <Grid
            item
            sx={{
              position: 'absolute',
              bottom: 'calc(50% + 200px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              mx: 0,
            }}
          >
            <PitchGraph />
          </Grid>
          <Grid
            item
            sx={{
              position: 'absolute',
              bottom: '0',
              left: '330px',
              right: '330px',
            }}
          >
            <LyricsPlayer />
          </Grid>
        </Grid>
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
      <Tooltip title="Settings">
        <IconButton
          sx={{ position: 'fixed', bottom: 10, left: 20, padding: 0 }}
          data-testid="settings-button"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
      <SettingsMenu
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        setCurrentTheme={setCurrentTheme}
      />
      <Microphone />
    </Container>
  );
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(GetColorTheme());

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
                      <MainPage setCurrentTheme={setCurrentTheme} />
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
