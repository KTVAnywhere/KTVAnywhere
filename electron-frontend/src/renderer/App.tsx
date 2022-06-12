import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Grid,
  Container,
  CssBaseline,
  Snackbar,
} from '@mui/material';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';
import QueueList, { QueueItemProps } from '../components/SongsQueue';
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
} from '../components/Alert.context';
import AudioPlayer from '../components/AudioPlayer';
import LyricsPlayer from '../components/LyricsPlayer';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ABFF95',
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

const MainPage = () => {
  const [, setSongList] = useState<SongProps[]>([]);
  const [, setQueue] = useState<QueueItemProps[]>([]);
  const [openSong, setOpenSong] = useState<SongProps>(emptySongProps);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<SongProps | null>(null);
  const [nextSong, setNextSong] = useState<SongProps | null>(null);
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(true);
  const [uploadedSongs, setUploadedSongs] = useState<SongProps[]>([]);
  const { songsStatus, setSongsStatus } = useSongsStatus();
  const [songInSpleeter, setSongInSpleeter] = useState<string | null>(null);
  const {
    alertMessage,
    setAlertMessage,
    showAlertMessage,
    setShowAlertMessage,
  } = useAlertMessage();

  useEffect(() => {
    const songsUnsubsribe = window.electron.store.songs.onChange((_, results) =>
      setSongList(results)
    );
    const queueItemsUnsubscribe = window.electron.store.queueItems.onChange(
      (_, results) => setQueue(results)
    );

    setSongList(window.electron.store.songs.getAllSongs() ?? []);
    setQueue(window.electron.store.queueItems.getAllQueueItems() ?? []);

    return () => {
      songsUnsubsribe();
      queueItemsUnsubscribe();
    };
  }, []);

  useEffect(() => {
    const spleeterProcessSongUnsubscribe =
      window.electron.preprocess.spleeterProcessResult(
        ({ vocalsPath, accompanimentPath, songId, error }) => {
          if (!error) {
            const songProcessedSuccessfully =
              window.electron.store.songs.getSong(songId);
            const changedSong = {
              ...songProcessedSuccessfully,
              vocalsPath,
              accompanimentPath,
            };
            window.electron.store.songs.setSong(changedSong);
            setAlertMessage({
              message: `Vocals separated successfully for ${songProcessedSuccessfully.songName}`,
              severity: 'success',
            });
            setShowAlertMessage(true);
          } else {
            console.error(error);
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
      spleeterProcessSongUnsubscribe();
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
      window.electron.preprocess.spleeterProcessSong(toProcess);
    }
  }, [songInSpleeter, songsStatus]);

  return (
    <Container>
      <CssBaseline enableColorScheme />
      <Snackbar
        open={showAlertMessage}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          setShowAlertMessage(false);
        }}
      >
        <Alert
          variant="filled"
          severity={alertMessage.severity}
          action={
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setShowAlertMessage(false)}
            >
              Close
            </Button>
          }
        >
          {alertMessage.message}
        </Alert>
      </Snackbar>
      <Container
        maxWidth={false}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: '130px',
        }}
      >
        <SongStagingDialogProvider>
          <SongDialogProvider>
            <LeftSidebar>
              <SongUploadButton setUploadedSongs={setUploadedSongs} />
              <SongList setOpenSong={setOpenSong} setNextSong={setNextSong} />
              <SongDialog song={openSong} setSong={setOpenSong} />
              <SongStagingDialog
                uploadedSongs={uploadedSongs}
                setUploadedSongs={setUploadedSongs}
              />
            </LeftSidebar>
          </SongDialogProvider>
        </SongStagingDialogProvider>
        <Grid container direction="column" alignItems="center">
          <Grid
            item
            sx={{
              position: 'absolute',
              bottom: '0',
              left: '330px',
              right: '330px',
              px: '2%',
              pb: '1%',
            }}
          >
            <LyricsPlayer
              currentSong={currentSong}
              currentTime={currentTime}
              lyricsEnabled={lyricsEnabled}
            />
          </Grid>
        </Grid>
        <RightSidebar>
          <QueueList setNextSong={setNextSong} />
        </RightSidebar>
      </Container>
      <Container
        maxWidth={false}
        sx={{
          bgcolor: '#1f2232',
          height: '130px',
          position: 'fixed',
          left: 0,
          bottom: 0,
        }}
      >
        <AudioPlayer
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          nextSong={nextSong}
          lyricsEnabled={lyricsEnabled}
          setLyricsEnabled={setLyricsEnabled}
        />
      </Container>
    </Container>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ThemeProvider theme={darkTheme}>
              <AlertMessageProvider>
                <SongsStatusProvider>
                  <MainPage />
                </SongsStatusProvider>
              </AlertMessageProvider>
            </ThemeProvider>
          }
        />
      </Routes>
    </Router>
  );
}
