import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Container, CssBaseline } from '@mui/material';
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
import { AudioPlayer } from '../components/AudioPlayer';
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
            const changedSong = {
              ...window.electron.store.songs.getSong(songId),
              vocalsPath,
              accompanimentPath,
            };
            window.electron.store.songs.setSong(changedSong);
          } else {
            console.error(error);
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
    <Container sx={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}>
      <CssBaseline enableColorScheme />
      <Container
        maxWidth={false}
        sx={{
          height: '88%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <LyricsPlayer
          currentSong={currentSong}
          currentTime={currentTime}
          lyricsEnabled={lyricsEnabled}
        />
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
        <RightSidebar>
          <QueueList setNextSong={setNextSong} />
        </RightSidebar>
      </Container>
      <Container
        maxWidth={false}
        sx={{
          bgcolor: '#1f2232',
          height: '12%',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <AudioPlayer
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          nextSong={nextSong}
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
              <SongsStatusProvider>
                <MainPage />
              </SongsStatusProvider>
            </ThemeProvider>
          }
        />
      </Routes>
    </Router>
  );
}
