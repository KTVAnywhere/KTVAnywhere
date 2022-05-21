import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  mockDndSpacing,
  makeDnd,
  DND_DIRECTION_UP,
  mockGetComputedStyle,
  DND_DRAGGABLE_DATA_ATTR,
} from 'react-beautiful-dnd-test-utils';
import { DequeueSong, EnqueueSong, QueueList } from '../components/SongsQueue';
import {
  emptyQueue,
  originalQueue,
  queueWithFourSongs,
  queueAfterDel,
  queueAfterDequeue,
  queueAfterEnqueue,
  queueAfterPositionSwap,
  songItemDequeued,
  songItemToEnqueue,
  sendItemToFrontQueue,
} from '../__testsData__/testData';

describe('QueueList buttons', () => {
  const mockFn = jest.fn();

  afterEach(() => {
    mockFn.mockClear();
  });

  test('clear queue button should empty the queue', () => {
    render(<QueueList queue={queueWithFourSongs} setQueue={mockFn} />);
    const clearQueueButton = screen.getByTestId('clear-queue-button');
    fireEvent.click(clearQueueButton);

    expect(mockFn.mock.calls[0][0]).toEqual([]);
  });

  test('delete button should delete song from queue', () => {
    render(<QueueList queue={queueWithFourSongs} setQueue={mockFn} />);
    const deleteSongInQueueButton = screen.getAllByTestId(
      'delete-song-from-queue-button'
    )[1];
    fireEvent.click(deleteSongInQueueButton);

    expect(mockFn.mock.calls[0][0]).toEqual(queueAfterDel);
  });

  test('up button should move song up in queue', () => {
    render(<QueueList queue={queueWithFourSongs} setQueue={mockFn} />);
    const swapSongPositionInQueueButton = screen.getAllByTestId(
      'move-song-up-in-queue-button'
    )[1];
    fireEvent.click(swapSongPositionInQueueButton);

    expect(mockFn.mock.calls[0][0]).toEqual(queueAfterPositionSwap);
  });

  test('send to front of queue button should move song to first item in queue', () => {
    render(<QueueList queue={queueWithFourSongs} setQueue={mockFn} />);
    const sendToFrontInQueueButton = screen.getAllByTestId(
      'send-to-front-of-queue-button'
    )[3];
    fireEvent.click(sendToFrontInQueueButton);

    expect(mockFn.mock.calls[0][0]).toEqual(sendItemToFrontQueue);
  });
});

describe('Drag and Drop QueueList', () => {
  const mockFn = jest.fn();

  beforeEach(() => {
    mockGetComputedStyle();
  });

  afterEach(() => {
    mockFn.mockClear();
  });

  test('drag and drop second song in queue to first', async () => {
    const { container } = render(
      <QueueList queue={queueWithFourSongs} setQueue={mockFn} />
    );
    mockDndSpacing(container);

    await makeDnd({
      getDragElement: () =>
        screen
          .getAllByTestId('draggable-queue-item')[1]
          .closest(DND_DRAGGABLE_DATA_ATTR),
      direction: DND_DIRECTION_UP,
      positions: 1,
    });

    expect(mockFn.mock.calls[0][0]).toEqual(queueAfterPositionSwap);
  });
});

describe('Enqueue and Dequeue', () => {
  const mockFn = jest.fn();

  afterEach(() => {
    mockFn.mockClear();
  });

  test('enqueue song', () => {
    EnqueueSong(originalQueue, mockFn, songItemToEnqueue);

    expect(mockFn.mock.calls[0][0]).toEqual(queueAfterEnqueue);
  });

  test('dequeue song', () => {
    const dequeuedItem = DequeueSong(queueAfterEnqueue, mockFn);

    expect(mockFn.mock.calls[0][0]).toEqual(queueAfterDequeue);
    expect(dequeuedItem).toEqual(songItemDequeued);
  });

  test('dequeue empty queue', () => {
    // mockFn will not be called within DequeueSong if queue is empty
    const dequeuedItem = DequeueSong(emptyQueue, mockFn);
    expect(dequeuedItem).toEqual(null);
  });
});
