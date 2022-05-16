import React, { Dispatch, SetStateAction, useState } from 'react';
import { SongProps } from './SongItem';

const QueueList = ({ queue }: { queue: SongProps[] }) => {
  return (
    <div>
      {queue.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Song</th>
              <th>Singer</th>
              <th>Song path</th>
              <th>Lyrics path</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((song, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{song.songName}</td>
                <td>{song.singer}</td>
                <td>{song.songPath}</td>
                <td>{song.lyricsPath}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No songs in queue</p>
      )}
    </div>
  );
};

export const SongsQueueManager = ({
  songs,
  queue,
  setQueue,
}: {
  songs: SongProps[];
  queue: SongProps[];
  setQueue: Dispatch<SetStateAction<SongProps[]>>;
}) => {
  const [queueItem, setQueueItem] = useState<SongProps>({} as SongProps);

  const handleAddSongToQueue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQueue([...queue, queueItem]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setQueueItem(songs[parseInt(event.target.value, 10)]);
  };

  return (
    <>
      <div>
        <h2>Songs queue</h2>
      </div>
      <form onSubmit={handleAddSongToQueue}>
        <label htmlFor="songName">
          Choose a song:
          <select onChange={handleChange}>
            {songs.map((song, index) => (
              <option key={song.songName} value={index}>
                {song.songName}
              </option>
            ))}
          </select>
        </label>
        <input type="submit" value="Add" />
      </form>
      <QueueList queue={queue} />
    </>
  );
};

export default SongsQueueManager;
