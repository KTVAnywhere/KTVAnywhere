import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  mockDndSpacing,
  makeDnd,
  DND_DIRECTION_UP,
  mockGetComputedStyle,
  DND_DRAGGABLE_DATA_ATTR,
} from 'react-beautiful-dnd-test-utils';
import QueueList, { DequeueSong, EnqueueSong } from '../components/SongsQueue';
import {
  queueTestDataWithSongs012,
  queueTestDataWithSongs102,
  queueTestDataWithSongs201,
  queueTestDataWithSongs01,
  queueTestDataWithSongs02,
  queueTestDataWithSong0,
  songTestData,
} from '../__testsData__/testData';
import mockedElectron from '../__testsData__/mocks';

describe('QueueList component buttons tests', () => {
  const mockGetAllQueueItems = () => queueTestDataWithSongs012;
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
          onChange: jest.fn().mockReturnValue(jest.fn()),
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

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs02);
  });

  test('up button should move song up in queue', () => {
    render(<QueueList setNextSong={mockSetNextSong} />);
    const swapSongPositionInQueueButton = screen.getAllByTestId(
      'move-song-up-in-queue-button'
    )[1];
    fireEvent.click(swapSongPositionInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs102);
  });

  test('send to front of queue button should move song to first item in queue', () => {
    render(<QueueList setNextSong={mockSetNextSong} />);
    const sendToFrontInQueueButton = screen.getAllByTestId(
      'send-to-front-of-queue-button'
    )[2];
    fireEvent.click(sendToFrontInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs201);
  });
});

describe('Drag and Drop tests on QueueList component', () => {
  const mockGetAllQueueItems = () => queueTestDataWithSongs012;
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
          onChange: jest.fn().mockReturnValue(jest.fn()),
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

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs102);
  });
});

describe('Enqueue and Dequeue tests', () => {
  const mockGetAllQueueItems = () => queueTestDataWithSong0;
  const mockGetSong = () => {
    return songTestData[0];
  };
  const mockSetAllQueueItems = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          getSong: mockGetSong,
        },
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
          onChange: jest.fn().mockReturnValue(jest.fn()),
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
    EnqueueSong(songTestData[1]);

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs01);
  });

  test('dequeue song', () => {
    const dequeuedItem = DequeueSong();

    expect(mockSetAllQueueItems).toBeCalledWith([]);
    expect(dequeuedItem).toEqual(songTestData[0]);
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
          onChange: jest.fn().mockReturnValue(jest.fn()),
        },
      },
    };
    // mockSetAllQueueItems will not be called within DequeueSong if queue is empty
    const dequeuedItem = DequeueSong();
    expect(dequeuedItem).toBeNull();
  });
});
