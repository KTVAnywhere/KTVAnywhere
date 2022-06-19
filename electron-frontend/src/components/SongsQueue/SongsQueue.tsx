import { useEffect, useState } from 'react';
import {
  Button,
  CardActions,
  CardContent,
  Container,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import uniqid from 'uniqid';
import { SongProps } from '../Song';
import { useAudioStatus } from '../AudioPlayer/AudioStatus.context';

export interface QueueItemProps {
  song: SongProps;
  queueItemId: string;
}

const setQueue = (queueList: QueueItemProps[]) => {
  window.electron.store.queueItems.setAllQueueItems(queueList);
};

export const QueueList = () => {
  const [queueItems, setQueueItems] = useState<QueueItemProps[]>([]);
  const { setNextSong } = useAudioStatus();

  useEffect(() => {
    setQueueItems(window.electron.store.queueItems.getAllQueueItems() ?? []);
    const queueItemsUnsubscribe = window.electron.store.queueItems.onChange(
      (_, results) => setQueueItems(results)
    );

    return () => {
      queueItemsUnsubscribe();
    };
  }, []);

  const deleteSongFromQueue = (index: number): void => {
    const newQueue = [
      ...queueItems.slice(0, index),
      ...queueItems.slice(index + 1),
    ];
    setQueue(newQueue);
  };

  const clearQueue = (): void => {
    setQueue([]);
  };

  const shiftSongUp = (index: number): void => {
    if (queueItems.length === 0 || queueItems.length === 1 || index === 0) {
      return;
    }
    if (index === 1) {
      const newQueue = [queueItems[1], queueItems[0], ...queueItems.slice(2)];
      setQueue(newQueue);
      return;
    }
    const newQueue = [
      ...queueItems.slice(0, index - 1),
      queueItems[index],
      queueItems[index - 1],
      ...queueItems.slice(index + 1),
    ];
    setQueue(newQueue);
  };

  const sendSongToFrontOfQueue = (index: number): void => {
    if (queueItems.length === 0 || queueItems.length === 1 || index === 0) {
      return;
    }
    const newQueue = [
      queueItems[index],
      ...queueItems.slice(0, index),
      ...queueItems.slice(index + 1),
    ];
    setQueue(newQueue);
  };

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    const items = Array.from(queueItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQueue(items);
  };

  const playSong = (index: number): void => {
    setNextSong(queueItems[index].song);
    deleteSongFromQueue(index);
  };

  return (
    <Container>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{
          paddingTop: '5%',
        }}
      >
        Songs Queue
      </Typography>
      <Button
        size="small"
        variant="contained"
        data-testid="clear-queue-button"
        onClick={() => clearQueue()}
        color="error"
      >
        Clear queue
      </Button>
      {queueItems.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="songsQueue">
            {(provided) => (
              <List
                aria-label="data"
                sx={{
                  width: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {queueItems.map((queueItem, index) => {
                  return (
                    <Draggable
                      key={queueItem.queueItemId}
                      draggableId={queueItem.queueItemId}
                      index={index}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...provided.dragHandleProps}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...provided.draggableProps}
                          data-testid="draggable-queue-item"
                          sx={{ px: 0 }}
                        >
                          <Card
                            sx={{
                              width: 1,
                            }}
                          >
                            <DragIndicatorIcon
                              sx={{
                                position: 'absolute',
                                top: '40%',
                                right: 0,
                              }}
                            />
                            <CardContent sx={{ height: '70px' }}>
                              <Typography noWrap variant="h5">
                                {queueItem.song.songName}
                              </Typography>
                              <Typography noWrap>
                                {queueItem.song.artist}
                              </Typography>
                            </CardContent>
                            <CardActions
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                              }}
                            >
                              <Button
                                sx={{ minWidth: '2px' }}
                                size="small"
                                variant="contained"
                                data-testid="play-now-button"
                                onClick={() => playSong(index)}
                              >
                                Play
                              </Button>
                              <Button
                                sx={{ minWidth: '2px' }}
                                size="small"
                                variant="contained"
                                data-testid="move-song-up-in-queue-button"
                                onClick={() => shiftSongUp(index)}
                              >
                                Up
                              </Button>
                              <Button
                                sx={{ minWidth: '2px' }}
                                variant="contained"
                                size="small"
                                data-testid="send-to-front-of-queue-button"
                                onClick={() => sendSongToFrontOfQueue(index)}
                              >
                                First
                              </Button>
                              <Button
                                sx={{ minWidth: '2px' }}
                                variant="contained"
                                size="small"
                                data-testid="delete-song-from-queue-button"
                                onClick={() => deleteSongFromQueue(index)}
                                color="error"
                              >
                                Delete
                              </Button>
                            </CardActions>
                          </Card>
                        </ListItem>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Typography
          sx={{
            paddingTop: '5%',
          }}
        >
          No songs in queue
        </Typography>
      )}
    </Container>
  );
};

export function EnqueueSong(song: SongProps): void {
  const queue = window.electron.store.queueItems.getAllQueueItems();
  setQueue([...queue, { song, queueItemId: uniqid() }]);
}

export function DequeueSong(): SongProps | null {
  const queue = window.electron.store.queueItems.getAllQueueItems();
  const nextSongId = queue.length > 0 ? queue[0].song.songId : null;
  const nextSong =
    nextSongId === null
      ? null
      : window.electron.store.songs.getSong(nextSongId);
  if (queue.length > 0) {
    setQueue([...queue.slice(1)]);
  }
  return nextSong;
}

export function GetQueueLength(): number {
  const queue = window.electron.store.queueItems.getAllQueueItems();
  return queue ? queue.length : 0;
}

export default QueueList;
