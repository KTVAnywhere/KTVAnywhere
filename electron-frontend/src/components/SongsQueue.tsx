import React, { Dispatch, SetStateAction, useState } from 'react';
import { SongProps } from './SongItem';

const QueueList = ({
  queue,
  shiftSongUp,
  deleteSongFromQueue,
}: {
  queue: SongProps[];
  shiftSongUp: (index: number) => void;
  deleteSongFromQueue: (index: number) => void;
}) => {
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((song, index) => (
              <>
                <tr>
                  <td>{index + 1}</td>
                  <td>{song.songName}</td>
                  <td>{song.singer}</td>
                  <td>{song.songPath}</td>
                  <td>{song.lyricsPath}</td>
                  <td>
                    <button type="button" onClick={() => shiftSongUp(index)}>
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSongFromQueue(index)}
                    >
                      delete
                    </button>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No songs in queue</p>
      )}
    </div>
  );
};

export const EnqueueSong = ({
  queue,
  setQueue,
  song,
}: {
  queue: SongProps[];
  setQueue: Dispatch<SetStateAction<SongProps[]>>;
  song: SongProps;
}): void => {
  setQueue([...queue, song]);
};

export const DequeueSong = ({
  queue,
  setQueue,
}: {
  queue: SongProps[];
  setQueue: Dispatch<SetStateAction<SongProps[]>>;
}): SongProps | null => {
  const nextSong = queue.length > 0 ? queue[0] : null;
  if (queue.length > 0) {
    setQueue(queue.slice(1));
  }
  return nextSong;
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

  const dropDownAddSongToQueue = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    if (queueItem === undefined || Object.keys(queueItem).length === 0) return;
    setQueue([...queue, queueItem]);
  };

  const handleDropDownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setQueueItem(songs[parseInt(event.target.value, 10)]);
  };

  const deleteSongFromQueue = (index: number): void => {
    const newQueue = [...queue.slice(0, index), ...queue.slice(index + 1)];
    setQueue(newQueue);
  };

  const shiftSongUp = (index: number): void => {
    if (queue.length === 0 || queue.length === 1 || index === 0) {
      return;
    }
    if (index === 1) {
      const newQueue = [queue[1], queue[0], ...queue.slice(2)];
      setQueue(newQueue);
      return;
    }
    const newQueue = [
      ...queue.slice(0, index - 1),
      queue[index],
      queue[index - 1],
      ...queue.slice(index + 1),
    ];
    setQueue(newQueue);
  };

  return (
    <>
      <div>
        <h2>Songs queue</h2>
      </div>
      <form onSubmit={dropDownAddSongToQueue}>
        <label htmlFor="songName">
          Choose a song:
          <select onChange={handleDropDownChange}>
            <option> </option>
            {songs.map((song, index) => (
              <option key={song.songName} value={index}>
                {song.songName}
              </option>
            ))}
          </select>
        </label>
        <input type="submit" value="Add" />
      </form>
      <QueueList
        queue={queue}
        shiftSongUp={shiftSongUp}
        deleteSongFromQueue={deleteSongFromQueue}
      />
    </>
  );
};

export default SongsQueueManager;
