import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { SongProps } from './SongItem';

export const QueueList = ({
  queue,
  setQueue,
}: {
  queue: SongProps[];
  setQueue: Dispatch<SetStateAction<SongProps[]>>;
}) => {
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

  const handleOnDragEnd = (result: DropResult): void => {
    if (!result.destination) return;

    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQueue(items);
  };

  return (
    <div className="QueueList">
      <header>songs queue</header>
      {queue.length > 0 ? (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="songsQueue">
            {(provided) => (
              <ul
                className="songsQueue"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {queue.map((song, index) => {
                  return (
                    <Draggable
                      key={song.songId}
                      draggableId={song.songId}
                      index={index}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...provided.dragHandleProps}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...provided.draggableProps}
                        >
                          <div>
                            <p>
                              {index + 1}
                              {song.songName}
                              {song.artist}
                              {song.songPath}
                              {song.lyricsPath}
                              <button
                                type="button"
                                data-testid="move-song-up-in-queue-button"
                                onClick={() => shiftSongUp(index)}
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                data-testid="delete-song-from-queue-button"
                                onClick={() => deleteSongFromQueue(index)}
                              >
                                delete
                              </button>
                            </p>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p>No songs in queue</p>
      )}
    </div>
  );
};

export function EnqueueSong(
  queue: SongProps[],
  setQueue: Dispatch<SetStateAction<SongProps[]>>,
  song: SongProps
): void {
  setQueue([...queue, song]);
}

export function DequeueSong(
  queue: SongProps[],
  setQueue: Dispatch<SetStateAction<SongProps[]>>
): SongProps | null {
  const nextSong = queue.length > 0 ? queue[0] : null;
  if (queue.length > 0) {
    setQueue([...queue.slice(1)]);
  }
  return nextSong;
}

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

  return (
    <>
      <div>
        <h2>Songs queue</h2>
      </div>
      <form onSubmit={dropDownAddSongToQueue}>
        <label htmlFor="songName">
          Choose a song:
          <select onChange={handleDropDownChange}>
            <option key="none"> </option>
            {React.Children.toArray(
              songs.map((song, index) => (
                <option value={index}>{song.songName}</option>
              ))
            )}
          </select>
        </label>
        <input type="submit" value="Add" />
      </form>
    </>
  );
};

export default SongsQueueManager;
