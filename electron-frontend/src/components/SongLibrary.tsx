import { Dispatch, SetStateAction } from 'react';
import { SongProps } from './SongItem';
import { EnqueueSong, QueueItemProps } from './SongsQueue';

const SongLibrary = ({
  setPopupTriggered,
  setOpenSong,
  queue,
  setQueue,
}: {
  setPopupTriggered: Dispatch<SetStateAction<boolean>>;
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
  queue: QueueItemProps[];
  setQueue: Dispatch<SetStateAction<QueueItemProps[]>>;
}) => {
  const handleDelete = (songId: string) => {
    window.electron.store.songs.deleteSong(songId);
  };
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
          {window.electron.store.songs.getAllSongs().map((song, index) => (
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
                <button type="button" onClick={() => handleDelete(song.songId)}>
                  Delete
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
