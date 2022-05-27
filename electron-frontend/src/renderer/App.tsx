import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
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
  const [leftSidebarTrigger, setLeftSidebarTrigger] = useState<boolean>(true);
  const [rightSidebarTrigger, setRightSidebarTrigger] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<SongProps | null>(null);
  const [nextSong, setNextSong] = useState<SongProps | null>(null);
  const [lyricsEnabled, setLyricsEnabled] = useState<boolean>(true);

  window.electron.store.songs.onChange((_, results) => setSongList(results));
  window.electron.store.queueItems.onChange((_, results) => setQueue(results));

  useEffect(() => {
    setSongList(window.electron.store.songs.getAllSongs() ?? []);
  }, []);

  useEffect(() => {
    setQueue(window.electron.store.queueItems.getAllQueueItems() ?? []);
  }, []);

  return (
    <div className="outer">
      <div className="bottom-box">
        <AudioPlayer
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          nextSong={nextSong}
          setLyricsEnabled={setLyricsEnabled}
        />
      </div>
      <div className="top-box">
        <LeftSidebar
          setTrigger={setLeftSidebarTrigger}
          trigger={leftSidebarTrigger}
        >
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
        <RightSidebar
          setTrigger={setRightSidebarTrigger}
          trigger={rightSidebarTrigger}
        >
          <QueueList setNextSong={setNextSong} />
        </RightSidebar>
        <LyricsPlayer
          currentSong={currentSong}
          currentTime={currentTime}
          lyricsEnabled={lyricsEnabled}
        />
      </div>
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
