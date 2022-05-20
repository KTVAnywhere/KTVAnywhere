import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';
import './App.css';
import {
  SongsQueueManager,
  QueueList,
  QueueItemProps,
} from '../components/SongsQueue';
import { SongProps, SongLibrary } from '../components/SongItem';
import SongUpload from '../components/SongUpload';

const SongTest = () => {
  const [songs, setSongList] = useState<SongProps[]>([]);
  const [queue, setQueue] = useState<QueueItemProps[]>([]);
  const [leftSidebarTrigger, setLeftSidebarTrigger] = useState<boolean>(false);
  const [rightSidebarTrigger, setRightSidebarTrigger] =
    useState<boolean>(false);

  return (
    <>
      <LeftSidebar
        setTrigger={setLeftSidebarTrigger}
        trigger={leftSidebarTrigger}
      >
        <SongUpload setSongList={setSongList} />
        <SongLibrary songs={songs} />
      </LeftSidebar>
      <RightSidebar
        setTrigger={setRightSidebarTrigger}
        trigger={rightSidebarTrigger}
      >
        <SongsQueueManager songs={songs} queue={queue} setQueue={setQueue} />
        <QueueList queue={queue} setQueue={setQueue} />
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
