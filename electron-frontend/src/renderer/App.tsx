import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import { SongProps, SongUpload, SongLibrary } from '../components/SongItem';
import { SongsQueueManager } from '../components/SongsQueue';

const SongTest = () => {
  const [songs, setSongList] = useState<SongProps[]>([]);
  const [queue, setQueue] = useState<SongProps[]>([]);
  return (
    <>
      <SongUpload songs={songs} setSongList={setSongList} />
      <SongLibrary songs={songs} />
      <SongsQueueManager songs={songs} queue={queue} setQueue={setQueue} />
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
