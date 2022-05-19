import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
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
} from '../__testsData__/testData';

describe('QueueList', () => {
  const mockFn = jest.fn();

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

    expect(mockFn.mock.calls[1][0]).toEqual(queueAfterPositionSwap);
  });
});

describe('Enqueue and Dequeue', () => {
  const mockFn = jest.fn();

  test('enqueue song', () => {
    EnqueueSong(originalQueue, mockFn, songItemToEnqueue);

    expect(mockFn.mock.calls[0][0]).toEqual(queueAfterEnqueue);
  });

  test('dequeue song', () => {
    const dequeuedItem = DequeueSong(queueAfterEnqueue, mockFn);

    expect(mockFn.mock.calls[1][0]).toEqual(queueAfterDequeue);
    expect(dequeuedItem).toEqual(songItemDequeued);
  });

  test('dequeue empty queue', () => {
    // mockFn will not be called within DequeueSong if queue is empty
    const dequeuedItem = DequeueSong(emptyQueue, mockFn);
    expect(dequeuedItem).toEqual(null);
  });
});
