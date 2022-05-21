import { Dispatch, SetStateAction } from 'react';
import { SongProps } from './SongItem';
import { EnqueueSong, QueueItemProps } from './SongsQueue';

const SongLibrary = ({
  songs,
  setPopupTriggered,
  setOpenSong,
  queue,
  setQueue,
}: {
  songs: SongProps[];
  setPopupTriggered: Dispatch<SetStateAction<boolean>>;
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
  queue: QueueItemProps[];
  setQueue: Dispatch<SetStateAction<QueueItemProps[]>>;
}) => {
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody aria-label="data">
          {songs.map((song, index) => (
            <tr key={song.songId}>
              <td>{index + 1}</td>
              <td>
                <div
                  role="button"
                  onClick={() => {
                    setPopupTriggered(true);
                    setOpenSong(song);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setPopupTriggered(true);
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
              <td>
                <button
                  type="button"
                  onClick={() => EnqueueSong(queue, setQueue, song)}
                >
                  Enqueue
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongLibrary;