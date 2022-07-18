import '@testing-library/jest-dom';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import * as Queue from '../components/SongsQueue';
import { QueueItemProps, MAX_QUEUE_LENGTH } from '../components/SongsQueue';
import SongComponent, {
  SongDialog,
  SongDialogProvider,
  SongsStatusProvider,
} from '../components/Song';
import { AudioStatusProvider } from '../components/AudioStatus.context';
import * as AudioStatusContext from '../components/AudioStatus.context';
import { AlertMessageProvider } from '../components/AlertMessage';
import * as AlertContext from '../components/AlertMessage';
import {
  ConfirmationDialog,
  ConfirmationProvider,
} from '../components/ConfirmationDialog';
import * as SongDialogContext from '../components/Song/SongDialog.context';
import SongList from '../components/SongList';
import { songTestData, songListTestData } from '../__testsData__/testData';
import mockedElectron, {
  mockedAudioStatus,
  mockedAlertMessage,
} from '../__testsData__/mocks';
import App from '../renderer/App';

describe('SongList', () => {
  const mockGetAll = () => songListTestData;
  const mockDelete = jest.fn();
  const mockSearch = jest.fn();
  const mockSetOpenSong = jest.fn();

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

  beforeEach(() => {
    global.AudioContext = AudioContext as any;
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          getAllSongs: mockGetAll,
          deleteSong: mockDelete,
          onChange: jest.fn().mockReturnValue(jest.fn()),
          search: mockSearch.mockResolvedValue(''),
        },
        queueItems: {
          ...mockedElectron.store.queueItems,
          getQueueLength: () => 0,
        },
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  test('song library should display list of songs', async () => {
    render(
      <AudioStatusProvider>
        <SongsStatusProvider>
          <SongList setOpenSong={mockSetOpenSong} />
        </SongsStatusProvider>
      </AudioStatusProvider>
    );

    expect(screen.getAllByRole('listitem').length).toEqual(2);
  });

  test('click play button should call setNextSong with the song clicked', async () => {
    const mockSetNextSong = jest.fn();
    jest
      .spyOn(AudioStatusContext, 'useAudioStatus')
      .mockReturnValue({ ...mockedAudioStatus, setNextSong: mockSetNextSong });
    render(
      <AudioStatusProvider>
        <SongsStatusProvider>
          <SongList setOpenSong={mockSetOpenSong} />
        </SongsStatusProvider>
      </AudioStatusProvider>
    );
    const firstPlayButton = screen.getAllByRole('button', {
      name: /Play/i,
    })[0];
    fireEvent.click(firstPlayButton);

    expect(mockSetNextSong).toBeCalledWith(songTestData[0]);
  });

  test('click enqueue button should add song to queue', async () => {
    const enqueueSpy = jest.spyOn(Queue, 'EnqueueSong');
    render(
      <AudioStatusProvider>
        <SongsStatusProvider>
          <SongList setOpenSong={mockSetOpenSong} />
        </SongsStatusProvider>
      </AudioStatusProvider>
    );
    const firstEnqueueButton = screen.getAllByRole('button', {
      name: /Enqueue/i,
    })[0];
    fireEvent.click(firstEnqueueButton);

    expect(enqueueSpy).toBeCalledWith(songTestData[0]);
  });

  test('click song name should open popup', async () => {
    const mockSetOpen = jest.fn();
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: mockSetOpen });
    render(
      <AudioStatusProvider>
        <SongsStatusProvider>
          <SongDialogProvider>
            <SongList setOpenSong={mockSetOpenSong} />
          </SongDialogProvider>
        </SongsStatusProvider>
      </AudioStatusProvider>
    );

    const song1button = screen.getByRole('button', {
      name: (content) => content.startsWith(songListTestData[0].songName),
    });
    fireEvent.click(song1button);

    expect(mockSetOpen).toBeCalledWith(true);
    expect(mockSetOpenSong).toBeCalledWith({
      ...songListTestData[0],
      songId: expect.any(String),
    });
  });

  test('typing a query should call searching function', async () => {
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: false, setOpen: jest.fn() });
    render(
      <AudioStatusProvider>
        <SongDialogProvider>
          <SongsStatusProvider>
            <SongList setOpenSong={jest.fn()} />
          </SongsStatusProvider>
        </SongDialogProvider>
      </AudioStatusProvider>
    );
    const searchBox = screen.getByRole('textbox');
    fireEvent.change(searchBox, {
      target: { value: songListTestData[1].songName },
    });
    await waitFor(() =>
      expect(mockSearch).toBeCalledWith(songListTestData[1].songName)
    );
  });
});

describe('SongList exceptions', () => {
  global.window.AudioContext = AudioContext as any;
  global.window.electron = mockedElectron;

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

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('search song failure', async () => {
    const exampleErrorMessage = 'something failed when searching song';
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          search: jest.fn().mockRejectedValue(exampleErrorMessage),
        },
      },
    };
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: false, setOpen: jest.fn() });
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    render(
      <AlertMessageProvider>
        <AudioStatusProvider>
          <SongDialogProvider>
            <SongsStatusProvider>
              <SongList setOpenSong={jest.fn()} />
            </SongsStatusProvider>
          </SongDialogProvider>
        </AudioStatusProvider>
      </AlertMessageProvider>
    );
    const searchBox = screen.getByRole('textbox');
    fireEvent.change(searchBox, {
      target: { value: songListTestData[1].songName },
    });
    await waitFor(() =>
      expect(mockSetAlertMessage).toBeCalledWith({
        message: `Searching error: ${exampleErrorMessage}`,
        severity: 'error',
      })
    );
  });
  test('add song to queue but queue is full', () => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getQueueLength: () => MAX_QUEUE_LENGTH,
        },
      },
    };
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    render(
      <AlertMessageProvider>
        <AudioStatusProvider>
          <SongDialogProvider>
            <SongsStatusProvider>
              <SongList setOpenSong={jest.fn()} />
            </SongsStatusProvider>
          </SongDialogProvider>
        </AudioStatusProvider>
      </AlertMessageProvider>
    );
    const firstEnqueueButton = screen.getAllByRole('button', {
      name: /Enqueue/i,
    })[0];
    fireEvent.click(firstEnqueueButton);
    expect(mockSetAlertMessage).toBeCalledWith({
      message: `Max queue length of ${MAX_QUEUE_LENGTH}`,
      severity: 'warning',
    });
  });
});

describe('Song', () => {
  const mockSet = jest.fn();
  const mockDelete = jest.fn();

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

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      dialog: {
        openFiles: jest.fn(),
        openFile: jest
          .fn()
          .mockResolvedValueOnce(songTestData[1].songPath)
          .mockResolvedValueOnce(songTestData[1].lyricsPath),
      },
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          setSong: mockSet,
          deleteSong: mockDelete,
        },
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: () => [] as QueueItemProps[],
        },
      },
      music: {
        getLrc: jest.fn().mockResolvedValue({
          lyricsPath: songTestData[1].lyricsPath,
          error: '',
        }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('song item should display song name, artist and paths', async () => {
    render(<SongComponent song={songTestData[0]} setSong={jest.fn()} />);

    expect(screen.getByText(songTestData[0].songName)).toBeInTheDocument();
    expect(screen.getByText(songTestData[0].artist)).toBeInTheDocument();
    expect(screen.getByText(songTestData[0].songPath)).toBeInTheDocument();
    expect(screen.getByText(songTestData[0].lyricsPath)).toBeInTheDocument();
  });

  test('editing song details will update the song', async () => {
    const mockSetSong = jest.fn();
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    render(
      <SongDialogProvider>
        <SongDialog song={songTestData[0]} setSong={mockSetSong} />
      </SongDialogProvider>
    );

    const nameButton = screen.getByTestId('edit-name');
    fireEvent.click(nameButton);
    const nameInput = screen.getByRole('textbox');
    fireEvent.change(nameInput, {
      target: { value: songTestData[1].songName },
    });
    fireEvent.focusOut(nameInput);

    const artistButton = screen.getByTestId('edit-artist');
    fireEvent.click(artistButton);
    const artistInput = screen.getByRole('textbox');
    fireEvent.change(artistInput, {
      target: { value: songTestData[1].artist },
    });
    fireEvent.focusOut(artistInput);

    const songPickerButton = screen.getByTestId('song-picker-button');
    fireEvent.click(songPickerButton);

    await waitFor(() =>
      expect(screen.getByText(songTestData[1].songPath)).toBeInTheDocument()
    );
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    fireEvent.click(lyricsPickerButton);

    await waitFor(() =>
      expect(screen.getByText(songTestData[1].lyricsPath)).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(mockSetSong).toBeCalledWith({
        ...songTestData[1],
        vocalsPath: expect.any(String),
        accompanimentPath: expect.any(String),
        graphPath: expect.any(String),
      })
    );
  });

  test('click fetch lyrics button will set lyrics path to new path', async () => {
    const mockSetSong = jest.fn();
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    render(
      <SongDialogProvider>
        <SongDialog song={songTestData[0]} setSong={mockSetSong} />
      </SongDialogProvider>
    );

    const fetchLyricsButton = screen.getByTestId('fetch-lyrics');
    fireEvent.click(fetchLyricsButton);

    await waitFor(() =>
      expect(
        screen.queryByText(songTestData[0].lyricsPath)
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText(songTestData[1].lyricsPath)).toBeInTheDocument();
  });

  test('click close button after making changes will show a confirmation dialog', async () => {
    global.AudioContext = AudioContext as any;
    const mediaDevicesPromise = Promise.resolve([]);
    const mockEnumerateDevices = jest.fn(() => mediaDevicesPromise);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: mockEnumerateDevices,
      },
    });
    render(<App />);
    const song1button = screen.getByRole('button', {
      name: (content) => content.startsWith(songListTestData[0].songName),
    });
    fireEvent.click(song1button);

    const nameButton = screen.getByTestId('edit-name');
    fireEvent.click(nameButton);
    const nameInput = screen.getByRole('textbox');
    fireEvent.change(nameInput, {
      target: { value: songTestData[1].songName },
    });
    fireEvent.focusOut(nameInput);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  }, 10000);

  test('delete button will remove song from database', () => {
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    render(
      <ConfirmationProvider>
        <SongDialogProvider>
          <SongDialog song={songTestData[0]} setSong={jest.fn()} />
        </SongDialogProvider>
        <ConfirmationDialog />
      </ConfirmationProvider>
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);
    expect(mockDelete).toBeCalledWith(songTestData[0].songId);
  });

  test('click save button will update the song in the database', () => {
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    render(
      <SongDialogProvider>
        <SongDialog song={songTestData[0]} setSong={jest.fn()} />
      </SongDialogProvider>
    );
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockSet).toBeCalledWith(songTestData[0]);
  });
});

describe('Song exceptions', () => {
  global.window.AudioContext = AudioContext as any;
  global.window.electron = mockedElectron;
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('no lyrics file fetched', async () => {
    global.window.electron = {
      ...mockedElectron,
      music: {
        getLrc: jest.fn().mockResolvedValue({
          lyricsPath: '',
          error: 'No lyrics for the song was found',
        }),
      },
    };
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    render(
      <AlertMessageProvider>
        <SongDialogProvider>
          <SongDialog song={songTestData[0]} setSong={jest.fn()} />
        </SongDialogProvider>
      </AlertMessageProvider>
    );

    const fetchLyricsButton = screen.getByTestId('fetch-lyrics');
    fireEvent.click(fetchLyricsButton);

    await waitFor(() =>
      expect(mockSetAlertMessage).toBeCalledWith({
        message: `Unable to fetch lyrics from online, possible fix: ensure internet connection and retry with different song/artist name`,
        severity: 'warning',
      })
    );
  });
  test('fetch lyrics file failure', async () => {
    const exampleErrorMessage = 'something failed';
    global.window.electron = {
      ...mockedElectron,
      music: {
        getLrc: jest.fn().mockRejectedValue(exampleErrorMessage),
      },
    };
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    render(
      <AlertMessageProvider>
        <SongDialogProvider>
          <SongDialog song={songTestData[0]} setSong={jest.fn()} />
        </SongDialogProvider>
      </AlertMessageProvider>
    );

    const fetchLyricsButton = screen.getByTestId('fetch-lyrics');
    fireEvent.click(fetchLyricsButton);

    await waitFor(() =>
      expect(mockSetAlertMessage).toBeCalledWith({
        message: `Error fetching lyrics from online: ${exampleErrorMessage}`,
        severity: 'error',
      })
    );
  });
  test('Error uploading song and lyrics file from song details', async () => {
    const exampleErrorMessage0 = 'something failed when uploading song file';
    const exampleErrorMessage1 = 'something failed when uploading lyrics file';
    global.window.electron = {
      ...mockedElectron,
      dialog: {
        openFiles: jest.fn(),
        openFile: jest
          .fn()
          .mockRejectedValueOnce(exampleErrorMessage0)
          .mockRejectedValueOnce(exampleErrorMessage1),
      },
    };
    jest
      .spyOn(SongDialogContext, 'useSongDialog')
      .mockReturnValue({ open: true, setOpen: jest.fn() });
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    render(
      <AlertMessageProvider>
        <SongDialogProvider>
          <SongDialog song={songTestData[0]} setSong={jest.fn()} />
        </SongDialogProvider>
      </AlertMessageProvider>
    );
    const songPickerButton = screen.getByTestId('song-picker-button');
    fireEvent.click(songPickerButton);
    await waitFor(() =>
      expect(mockSetAlertMessage).toBeCalledWith({
        message: `Error uploading file: ${exampleErrorMessage0}`,
        severity: 'error',
      })
    );
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(mockSetAlertMessage).toBeCalledWith({
        message: `Error uploading file: ${exampleErrorMessage1}`,
        severity: 'error',
      })
    );
  });
});
