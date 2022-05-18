import { useState } from 'react';

import Popup from './Popup';

export interface SongProps {
  songId: string;
  songName: string;
  artist: string;
  songPath: string;
  lyricsPath: string;
}

const SongComponent = ({ song }: { song: SongProps }) => {
  const { songName, artist, songPath, lyricsPath } = song;
  return (
    <div>
      <p>
        <strong>Name: </strong>
        {songName}
      </p>
      <p>
        <strong>Artist: </strong>
        {artist}
      </p>
      <p>
        <strong>Path: </strong>
        {songPath}
      </p>
      <p>
        <strong>Lyrics: </strong>
        {lyricsPath}
      </p>
    </div>
  );
};

export const SongLibrary = ({ songs }: { songs: SongProps[] }) => {
  const [songPopup, setSongPopup] = useState<boolean>(false);
  const [openSong, setOpenSong] = useState<SongProps>({} as SongProps);
  return (
    <div>
      <h2>Song library</h2>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Song</th>
            <th>Artist</th>
            <th>Song path</th>
            <th>Lyrics path</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={song.songId}>
              <td>{index}</td>
              <td>
                <div
                  role="button"
                  onClick={() => {
                    setSongPopup(true);
                    setOpenSong(song);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setSongPopup(true);
                      setOpenSong(song);
                    }
                  }}
                  tabIndex={index}
                >
                  {song.songName}
                </div>
              </td>
              <td>{song.artist}</td>
              <td>{song.songPath}</td>
              <td>{song.lyricsPath}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Popup trigger={songPopup} setTrigger={setSongPopup}>
        <SongComponent song={openSong} />
      </Popup>
    </div>
  );
};

export default SongComponent;
