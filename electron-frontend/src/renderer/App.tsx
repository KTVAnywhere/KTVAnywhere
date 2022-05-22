import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';
import './App.css';
import { QueueList, QueueItemProps } from '../components/SongsQueue';
import SongComponent, {
  emptySongProps,
  SongProps,
} from '../components/SongItem';
import SongLibrary from '../components/SongLibrary';
import SongUpload from '../components/SongUpload';
import Popup from '../components/Popup';

const SongTest = () => {
  const [, setSongList] = useState<SongProps[]>([]);
  const [, setQueue] = useState<QueueItemProps[]>([]);
  const [openSong, setOpenSong] = useState<SongProps>(emptySongProps);
  const [songPopupTriggered, setSongPopupTriggered] = useState<boolean>(false);
  const [leftSidebarTrigger, setLeftSidebarTrigger] = useState<boolean>(false);
  const [rightSidebarTrigger, setRightSidebarTrigger] =
    useState<boolean>(false);

  window.electron.store.songs.onChange((_, results) => setSongList(results));
  window.electron.store.queueItems.onChange((_, results) => setQueue(results));

  useEffect(() => {
    setSongList(window.electron.store.songs.getAllSongs() ?? []);
  }, []);

  useEffect(() => {
    setQueue(window.electron.store.queueItems.getAllQueueItems() ?? []);
  }, []);

  return (
    <>
      <LeftSidebar
        setTrigger={setLeftSidebarTrigger}
        trigger={leftSidebarTrigger}
      >
        <SongUpload />
        <SongLibrary
          setPopupTriggered={setSongPopupTriggered}
          setOpenSong={setOpenSong}
        />
        <Popup trigger={songPopupTriggered} setTrigger={setSongPopupTriggered}>
          <SongComponent song={openSong} />
        </Popup>
      </LeftSidebar>
      <RightSidebar
        setTrigger={setRightSidebarTrigger}
        trigger={rightSidebarTrigger}
      >
        <QueueList />
      </RightSidebar>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SongTest />
            </>
          }
        />
      </Routes>
    </Router>
  );
}
