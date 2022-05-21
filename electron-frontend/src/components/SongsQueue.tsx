import { Dispatch, SetStateAction } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import uniqid from 'uniqid';
import { SongProps } from './SongItem';
import './SongsQueue.css';

export interface QueueItemProps {
  song: SongProps;
  queueItemId: string;
}

export const QueueList = ({
  queue,
  setQueue,
}: {
  queue: QueueItemProps[];
  setQueue: Dispatch<SetStateAction<QueueItemProps[]>>;
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
      <h2>Songs Queue</h2>
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
                {queue.map((queueItem, index) => {
                  return (
                    <Draggable
                      key={queueItem.queueItemId}
                      draggableId={queueItem.queueItemId}
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
                            <pre>
                              <strong>{index + 1}</strong>
                              {'   '}
                              {queueItem.song.songName}
                              {'  by  '}
                              {queueItem.song.artist}
                              {'   '}
                            </pre>
                            <button
                              type="button"
                              data-testid="move-song-up-in-queue-button"
                              onClick={() => shiftSongUp(index)}
                            >
                              up
                            </button>{' '}
                            <button
                              className="delete-song-from-queue-button"
                              type="button"
                              data-testid="delete-song-from-queue-button"
                              onClick={() => deleteSongFromQueue(index)}
                            >
                              remove
                            </button>
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
  queue: QueueItemProps[],
  setQueue: Dispatch<SetStateAction<QueueItemProps[]>>,
  song: SongProps
): void {
  setQueue([...queue, { song, queueItemId: uniqid() }]);
}

export function DequeueSong(
  queue: QueueItemProps[],
  setQueue: Dispatch<SetStateAction<QueueItemProps[]>>
): SongProps | null {
  const nextSong = queue.length > 0 ? queue[0].song : null;
  if (queue.length > 0) {
    setQueue([...queue.slice(1)]);
  }
  return nextSong;
}

export default QueueList;
