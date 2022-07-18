import { useEffect, useState } from 'react';
import {
  CardActions,
  CardContent,
  Container,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import QueueIcon from '@mui/icons-material/Queue';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import uniqid from 'uniqid';
import { SongProps } from '../Song';
import { useAudioStatus } from '../AudioStatus.context';
import { useAlertMessage } from '../AlertMessage';

export interface QueueItemProps {
  song: SongProps;
  queueItemId: string;
}

export const MAX_QUEUE_LENGTH = 30;

export const QueueNotFull = () =>
  window.electron.store.queueItems.getQueueLength() < MAX_QUEUE_LENGTH;

const setQueue = (queueList: QueueItemProps[]) =>
  window.electron.store.queueItems.setAllQueueItems(queueList);

export const EnqueueSong = (song: SongProps) => {
  if (QueueNotFull()) {
    window.electron.store.queueItems.enqueueItem({
      song,
      queueItemId: uniqid(),
    });
  }
};

export const DequeueSong = () => window.electron.store.queueItems.dequeueItem();

export const QueueList = () => {
  const [queueItems, setQueueItems] = useState<QueueItemProps[]>([]);
  const { setNextSong } = useAudioStatus();
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    setQueueItems(window.electron.store.queueItems.getAllQueueItems() ?? []);
    const queueItemsUnsubscribe = window.electron.store.queueItems.onChange(
      (_, results) => setQueueItems(results)
    );

    return () => queueItemsUnsubscribe();
  }, []);

  const deleteSongFromQueue = (index: number) => {
    const newQueue = [
      ...queueItems.slice(0, index),
      ...queueItems.slice(index + 1),
    ];
    setQueue(newQueue);
  };

  const clearQueue = () => setQueue([]);

  const addRandomSong = () => {
    const randomSong = window.electron.store.songs.getRandomSong();
    if (randomSong !== null) {
      if (QueueNotFull()) {
        EnqueueSong(randomSong);
      } else {
        setAlertMessage({
          message: `Max queue length of ${MAX_QUEUE_LENGTH}`,
          severity: 'warning',
        });
      }
    }
  };

  const shuffleQueue = () => window.electron.store.queueItems.shuffleQueue();

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
          pt: '5%',
        }}
      >
        Songs Queue
      </Typography>
      <Tooltip title="Shuffle queue" placement="bottom">
        <IconButton
          aria-label="Shuffle queue"
          onClick={shuffleQueue}
          data-testid="shuffle-queue-button"
        >
          <ShuffleIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add random song" placement="bottom">
        <IconButton
          aria-label="Add random song"
          onClick={addRandomSong}
          data-testid="add-random-song-button"
        >
          <QueueIcon />
        </IconButton>
      </Tooltip>
      {queueItems.length > 0 && (
        <Tooltip title="Clear queue" placement="bottom">
          <IconButton
            aria-label="Clear queue"
            onClick={clearQueue}
            color="error"
            data-testid="clear-queue-button"
          >
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      )}
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
                              <Tooltip title="Play song" placement="top">
                                <IconButton
                                  aria-label="play"
                                  onClick={() => playSong(index)}
                                  data-testid="play-now-button"
                                >
                                  <PlayArrowIcon fontSize="medium" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Up" placement="top">
                                <IconButton
                                  aria-label="up"
                                  data-testid="move-song-up-in-queue-button"
                                  onClick={() => shiftSongUp(index)}
                                >
                                  <KeyboardArrowUpIcon fontSize="medium" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="First" placement="top">
                                <IconButton
                                  aria-label="first"
                                  data-testid="send-to-front-of-queue-button"
                                  onClick={() => sendSongToFrontOfQueue(index)}
                                >
                                  <KeyboardDoubleArrowUpIcon fontSize="medium" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => deleteSongFromQueue(index)}
                                  color="error"
                                  data-testid="delete-song-from-queue-button"
                                >
                                  <DeleteIcon fontSize="medium" />
                                </IconButton>
                              </Tooltip>
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
          textAlign="center"
          sx={{
            mt: '5%',
          }}
        >
          No songs in queue
        </Typography>
      )}
    </Container>
  );
};

export default QueueList;
