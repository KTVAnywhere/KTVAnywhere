import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  mockDndSpacing,
  makeDnd,
  DND_DIRECTION_UP,
  mockGetComputedStyle,
  DND_DRAGGABLE_DATA_ATTR,
} from 'react-beautiful-dnd-test-utils';
import QueueList, {
  DequeueSong,
  EnqueueSong,
  MAX_QUEUE_LENGTH,
} from '../components/SongsQueue';
import { AlertMessageProvider } from '../components/AlertMessage';
import * as AlertContext from '../components/AlertMessage';
import {
  queueTestDataWithSongs012,
  queueTestDataWithSongs102,
  queueTestDataWithSongs201,
  queueTestDataWithSongs02,
  songTestData,
} from '../__testsData__/testData';
import mockedElectron, { mockedAlertMessage } from '../__testsData__/mocks';

describe('QueueList buttons', () => {
  // mock AutoSizer start
  const originalOffsetHeight: any = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth: any = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetWidth'
  );
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 50,
    });
  });
  afterAll(() => {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth
    );
  });
  // mock AutoSizer end

  const mockGetAllQueueItems = () => queueTestDataWithSongs012;
  const mockSetAllQueueItems = jest.fn();
  const mockShuffleQueue = jest.fn();
  const mockGetQueueLength = () => queueTestDataWithSongs012.length;

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
          shuffleQueue: mockShuffleQueue,
          getQueueLength: mockGetQueueLength,
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

  test('click shuffle queue button should shuffle queue', () => {
    render(<QueueList />);
    const shuffleQueueButton = screen.getByTestId('shuffle-queue-button');
    fireEvent.click(shuffleQueueButton);

    expect(mockShuffleQueue).toBeCalled();
  });

  test('click add random song button should add random song to queue', () => {
    const mockGetRandomSong = jest.fn().mockReturnValue(songTestData[0]);
    const mockEnqueueItem = jest.fn();
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          getRandomSong: mockGetRandomSong,
        },
        queueItems: {
          ...mockedElectron.store.queueItems,
          enqueueItem: mockEnqueueItem,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
          shuffleQueue: mockShuffleQueue,
          getQueueLength: mockGetQueueLength,
          onChange: jest.fn().mockReturnValue(jest.fn()),
        },
      },
    };
    render(<QueueList />);
    const addRandomSongButton = screen.getByTestId('add-random-song-button');
    fireEvent.click(addRandomSongButton);
    expect(mockGetRandomSong).toBeCalled();
    expect(mockEnqueueItem).toBeCalledWith({
      song: songTestData[0],
      queueItemId: expect.any(String),
    });
  });

  test('click clear queue button should empty the queue', () => {
    render(<QueueList />);
    const clearQueueButton = screen.getByTestId('clear-queue-button');
    fireEvent.click(clearQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith([]);
  });

  test('click delete button should delete song from queue', () => {
    render(<QueueList />);
    const deleteSongInQueueButton = screen.getAllByTestId(
      'delete-song-from-queue-button'
    )[1];
    fireEvent.click(deleteSongInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs02);
  });

  test('click up button should move song up in queue', () => {
    render(<QueueList />);
    const swapSongPositionInQueueButton = screen.getAllByTestId(
      'move-song-up-in-queue-button'
    )[1];
    fireEvent.click(swapSongPositionInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs102);
  });

  test('click send to front of queue button should move song to front of queue', () => {
    render(<QueueList />);
    const sendToFrontInQueueButton = screen.getAllByTestId(
      'send-to-front-of-queue-button'
    )[2];
    fireEvent.click(sendToFrontInQueueButton);

    expect(mockSetAllQueueItems).toBeCalledWith(queueTestDataWithSongs201);
  });
});

describe('QueueList drag and drop song in queue', () => {
  // mock AutoSizer start
  const originalOffsetHeight: any = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth: any = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetWidth'
  );
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 50,
    });
  });
  afterAll(() => {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth
    );
  });
  // mock AutoSizer end

  const mockGetAllQueueItems = () => queueTestDataWithSongs012;
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
    const { container } = render(<QueueList />);
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
  const mockEnqueueItem = jest.fn();
  const mockDequeueItem = () => songTestData[0];

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          enqueueItem: mockEnqueueItem,
          dequeueItem: mockDequeueItem,
          getQueueLength: () => 1,
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

    expect(mockEnqueueItem).toBeCalledWith({
      song: songTestData[1],
      queueItemId: expect.any(String),
    });
  });

  test('dequeue song', () => {
    expect(DequeueSong()).toEqual(songTestData[0]);
  });

  test('dequeue empty queue', () => {
    const mockDequeueNone = () => null;
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          dequeueItem: mockDequeueNone,
        },
      },
    };
    expect(DequeueSong()).toBeNull();
  });
});

describe('QueueList exceptions', () => {
  const mockGetRandomSong = jest.fn().mockReturnValue(songTestData[0]);
  const mockGetAllQueueItems = () => {
    const array = new Array(MAX_QUEUE_LENGTH);
    for (let i = 0; i < MAX_QUEUE_LENGTH; i += 1) {
      array[i] = { song: songTestData[0], queueItemId: `${i}` };
    }
    return array;
  };
  const mockGetQueueLength = () => MAX_QUEUE_LENGTH;
  const mockSetAllQueueItems = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          getRandomSong: mockGetRandomSong,
        },
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
          setAllQueueItems: mockSetAllQueueItems,
          getQueueLength: mockGetQueueLength,
          onChange: jest.fn().mockReturnValue(jest.fn()),
        },
      },
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('add random song but queue is full', () => {
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    render(
      <AlertMessageProvider>
        <QueueList />
      </AlertMessageProvider>
    );
    const addRandomSongButton = screen.getByTestId('add-random-song-button');
    fireEvent.click(addRandomSongButton);
    expect(mockSetAlertMessage).toBeCalledWith({
      message: `Max queue length of ${MAX_QUEUE_LENGTH}`,
      severity: 'warning',
    });
  });
});
