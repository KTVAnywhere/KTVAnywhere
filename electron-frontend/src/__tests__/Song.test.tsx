import '@testing-library/jest-dom';
import {
  render,
  fireEvent,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import * as Queue from '../components/SongsQueue';
import SongComponent, {
  SongDialog,
  SongDialogProvider,
  SongsStatusProvider,
} from '../components/Song';
import * as SongDialogContext from '../components/Song/SongDialog.context';
import SongList from '../components/SongList';
import { songTestData, songListTestData } from '../__testsData__/testData';
import mockedElectron from '../__testsData__/mocks';

describe('SongList', () => {
  const mockGetAll = () => songListTestData;
  const mockDelete = jest.fn();

  const mockSetOpenSong = jest.fn();
  const mockSetNextSong = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          getAllSongs: mockGetAll,
          deleteSong: mockDelete,
        },
      },
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  test('song library should display list of songs', async () => {
    render(
      <SongsStatusProvider>
        <SongList setOpenSong={mockSetOpenSong} setNextSong={mockSetNextSong} />
      </SongsStatusProvider>
    );
    const { getAllByRole } = within(
      screen.getByRole('list', { name: /data/i })
    );

    expect(getAllByRole('listitem').length).toEqual(2);
  });

  test('click play button should call setNextSong with the song clicked', async () => {
    render(
      <SongsStatusProvider>
        <SongList setOpenSong={mockSetOpenSong} setNextSong={mockSetNextSong} />
      </SongsStatusProvider>
    );
    const { getAllByRole } = within(
      screen.getByRole('list', { name: /data/i })
    );
    const firstPlayButton = getAllByRole('button', {
      name: /Play/i,
    })[0];
    fireEvent.click(firstPlayButton);

    expect(mockSetNextSong).toBeCalledWith(songTestData[0]);
  });

  test('click enqueue button should add song to queue', async () => {
    const enqueueSpy = jest.spyOn(Queue, 'EnqueueSong');
    render(
      <SongsStatusProvider>
        <SongList setOpenSong={mockSetOpenSong} setNextSong={mockSetNextSong} />
      </SongsStatusProvider>
    );
    const { getAllByRole } = within(
      screen.getByRole('list', { name: /data/i })
    );
    const firstEnqueueButton = getAllByRole('button', {
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
      <SongsStatusProvider>
        <SongDialogProvider>
          <SongList
            setOpenSong={mockSetOpenSong}
            setNextSong={mockSetNextSong}
          />
        </SongDialogProvider>
      </SongsStatusProvider>
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
});

describe('Song', () => {
  const mockSet = jest.fn();
  const mockDelete = jest.fn();
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
      },
      music: {
        getLrc: jest.fn().mockResolvedValue({
          lyricsPath: songTestData[1].lyricsPath,
          error: '',
        }),
      },
    };
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

    await waitFor(() => expect(mockSetSong).toBeCalledWith(songTestData[1]));
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
