import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import {
  SongsQueueManager,
  QueueList,
  QueueItemProps,
} from '../components/SongsQueue';
import SongComponent, {
  emptySongProps,
  SongProps,
} from '../components/SongItem';
import SongLibrary from '../components/SongLibrary';
import SongUpload from '../components/SongUpload';
import Popup from '../components/Popup';

const SongTest = () => {
  const [songs, setSongList] = useState<SongProps[]>([]);
  const [openSong, setOpenSong] = useState<SongProps>(emptySongProps);
  const [songPopupTriggered, setSongPopupTriggered] = useState<boolean>(false);
  const [queue, setQueue] = useState<QueueItemProps[]>([]);
  return (
    <>
      <SongUpload setSongList={setSongList} />
      <SongLibrary
        songs={songs}
        setPopupTriggered={setSongPopupTriggered}
        setOpenSong={setOpenSong}
      />
      <Popup trigger={songPopupTriggered} setTrigger={setSongPopupTriggered}>
        <SongComponent song={openSong} />
      </Popup>
      <SongsQueueManager songs={songs} queue={queue} setQueue={setQueue} />
      <QueueList queue={queue} setQueue={setQueue} />
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
