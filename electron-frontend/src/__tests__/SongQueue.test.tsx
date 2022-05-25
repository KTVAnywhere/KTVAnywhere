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
  queueAfterDel,
  queueAfterEnqueue,
  queueAfterPositionSwap,
  sendItemToFrontQueue,
  testSong2,
  testSong,
  queueWithFourSongs,
  queueWithOneSong,
} from '../__testsData__/testData';
import mockedElectron from '../__testsData__/mocks';

describe('QueueList buttons', () => {
  const mockGetAllQueueItems = () => queueWithFourSongs;
  const mockSetAllQueueItems = jest.fn();
  const mockSetNextSong = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
        },
      },
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('clear queue button should empty the queue', () => {
    render(<QueueList setNextSong={mockSetNextSong} />);
    const clearQueueButton = screen.getByTestId('clear-queue-button');
    fireEvent.click(clearQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith([]);
  });

  test('delete button should delete song from queue', () => {
    render(<QueueList setNextSong={mockSetNextSong} />);
    const deleteSongInQueueButton = screen.getAllByTestId(
      'delete-song-from-queue-button'
    )[1];
    fireEvent.click(deleteSongInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueAfterDel);
  });

  test('up button should move song up in queue', () => {
    render(<QueueList setNextSong={mockSetNextSong} />);
    const swapSongPositionInQueueButton = screen.getAllByTestId(
      'move-song-up-in-queue-button'
    )[1];
    fireEvent.click(swapSongPositionInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueAfterPositionSwap);
  });

  test('send to front of queue button should move song to first item in queue', () => {
    render(<QueueList setNextSong={mockSetNextSong} />);
    const sendToFrontInQueueButton = screen.getAllByTestId(
      'send-to-front-of-queue-button'
    )[3];
    fireEvent.click(sendToFrontInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(sendItemToFrontQueue);
  });
});

describe('Drag and Drop QueueList', () => {
  const mockGetAllQueueItems = () => queueWithFourSongs;
  const mockSetAllQueueItems = jest.fn();
  const mockSetNextSong = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
        },
      },
    };
    mockGetComputedStyle();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('drag and drop second song in queue to first', async () => {
    const { container } = render(<QueueList setNextSong={mockSetNextSong} />);
    mockDndSpacing(container);

    await makeDnd({
      getDragElement: () =>
        screen
          .getAllByTestId('draggable-queue-item')[1]
          .closest(DND_DRAGGABLE_DATA_ATTR),
      direction: DND_DIRECTION_UP,
      positions: 1,
    });

    expect(mockSetAllQueueItems).toBeCalledWith(queueAfterPositionSwap);
  });
});

describe('Enqueue and Dequeue', () => {
  const mockGetAllQueueItems = () => queueWithOneSong;
  const mockSetAllQueueItems = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
        },
      },
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('enqueue song', () => {
    EnqueueSong(testSong2);

    expect(mockSetAllQueueItems).toBeCalledWith(queueAfterEnqueue);
  });

  test('dequeue song', () => {
    const dequeuedItem = DequeueSong();

    expect(mockSetAllQueueItems).toBeCalledWith([]);
    expect(dequeuedItem).toEqual(testSong);
  });

  test('dequeue empty queue', () => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: () => [],
          setAllQueueItems: mockSetAllQueueItems,
        },
      },
    };
    // mockSetAllQueueItems will not be called within DequeueSong if queue is empty
    const dequeuedItem = DequeueSong();
    expect(dequeuedItem).toBeNull();
  });
});
