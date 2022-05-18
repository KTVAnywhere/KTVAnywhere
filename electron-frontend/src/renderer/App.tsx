import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import { SongProps, SongLibrary } from '../components/SongItem';
import SongUpload from '../components/SongUpload';

const SongTest = () => {
  const [songs, setSongList] = useState<SongProps[]>([]);
  return (
    <>
      <SongUpload setSongList={setSongList} />
      <SongLibrary songs={songs} />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SongTest />} />
      </Routes>
    </Router>
  );
}
