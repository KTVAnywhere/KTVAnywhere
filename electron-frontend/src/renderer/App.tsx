import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  Drawer,
  ScopedCssBaseline,
} from '@mui/material';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';
import QueueList, { QueueItemProps } from '../components/SongsQueue';
import Song, { emptySongProps, SongProps } from '../components/Song';
import SongList from '../components/SongList';
import SongUpload from '../components/SongUpload';
import Popup from '../components/Popup';
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
  const [songPopupTriggered, setSongPopupTriggered] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<SongProps | null>(null);
  const [nextSong, setNextSong] = useState<SongProps | null>(null);
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(true);

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

  return (
    <div className="outer">
      <CssBaseline enableColorScheme />
      <Container
        maxWidth={false}
        sx={{
          height: '88%',
        }}
      >
        <LyricsPlayer
          currentSong={currentSong}
          currentTime={currentTime}
          lyricsEnabled={lyricsEnabled}
        />
        <LeftSidebar>
          <SongUpload />
          <SongList
            setPopupTriggered={setSongPopupTriggered}
            setOpenSong={setOpenSong}
            setNextSong={setNextSong}
          />
          <Popup
            trigger={songPopupTriggered}
            setTrigger={setSongPopupTriggered}
          >
            <Song song={openSong} />
          </Popup>
        </LeftSidebar>
        <RightSidebar>
          <QueueList setNextSong={setNextSong} />
        </RightSidebar>
      </Container>
      <Container
        maxWidth={false}
        sx={{
          bgcolor: '#1f2232',
          height: '12%',
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
    </div>
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
              <MainPage />
            </ThemeProvider>
          }
        />
      </Routes>
    </Router>
  );
}
