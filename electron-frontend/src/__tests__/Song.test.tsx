import '@testing-library/jest-dom';
import {
  render,
  fireEvent,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import SongComponent from '../components/SongItem';
import SongUpload from '../components/SongUpload';
import SongLibrary from '../components/SongLibrary';
import { testSong, testSong2, testLibrary } from '../__testsData__/testData';
import mockedElectron from '../__testsData__/mocks';

describe('SongUpload', () => {
  const mockAdd = jest.fn();
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      dialog: {
        openFile: jest
          .fn()
          .mockResolvedValueOnce(testSong.songPath)
          .mockResolvedValueOnce(testSong.lyricsPath)
          .mockResolvedValueOnce(testSong2.songPath)
          .mockResolvedValueOnce(testSong2.lyricsPath),
      },
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          addSong: mockAdd,
        },
      },
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('song picker should set input value to name of file', async () => {
    render(<SongUpload />);
    const songPickerButton = screen.getByTestId('song-picker-button');
    const songPickerInput = screen.getByTestId('song-picker-input');
    fireEvent.click(songPickerButton);

    await waitFor(() =>
      expect(songPickerInput).toHaveValue('bensound-energy.mp3')
    );
  });

  test('song object should be returned on submit', async () => {
    render(<SongUpload />);
    const songNameInput = screen.getByTestId('song-name-input');
    const artistInput = screen.getByTestId('artist-input');
    const songPickerButton = screen.getByTestId('song-picker-button');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    fireEvent.change(songNameInput, { target: { value: testSong.songName } });
    fireEvent.change(artistInput, { target: { value: testSong.artist } });
    fireEvent.click(songPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('song-picker-input')).toHaveValue()
    );
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('lyrics-picker-input')).toHaveValue()
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockAdd).toBeCalledWith(testSong));
  });

  test('form should not submit if song name is not filled in', async () => {
    render(<SongUpload />);
    const artistInput = screen.getByTestId('artist-input');
    const songPickerButton = screen.getByTestId('song-picker-button');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    fireEvent.change(artistInput, { target: { value: testSong.artist } });
    fireEvent.click(songPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('song-picker-input')).toHaveValue()
    );
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('lyrics-picker-input')).toHaveValue(
        'bensound-energy.lrc'
      )
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockAdd).toBeCalledTimes(0));
  });

  test('form should not submit if song is not picked', async () => {
    render(<SongUpload />);
    const songNameInput = screen.getByTestId('song-name-input');
    const artistInput = screen.getByTestId('artist-input');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    fireEvent.change(songNameInput, { target: { value: testSong.songName } });
    fireEvent.change(artistInput, { target: { value: testSong.artist } });
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('lyrics-picker-input')).toHaveValue()
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockAdd).toBeCalledTimes(0));
  });
});

describe('SongLibrary', () => {
  const mockGetAll = () => testLibrary;
  const mockDelete = jest.fn();
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
    const mockSetPopup = jest.fn();
    const mockSetOpenSong = jest.fn();
    const mockSetNextSong = jest.fn();
    render(
      <SongLibrary
        setPopupTriggered={mockSetPopup}
        setOpenSong={mockSetOpenSong}
        setNextSong={mockSetNextSong}
      />
    );
    const { getAllByRole } = within(
      screen.getByRole('list', { name: /data/i })
    );

    expect(getAllByRole('listitem').length).toEqual(2);
  });

  test('delete button should delete song from library', async () => {
    const mockSetPopup = jest.fn();
    const mockSetOpenSong = jest.fn();
    const mockSetNextSong = jest.fn();
    render(
      <SongLibrary
        setPopupTriggered={mockSetPopup}
        setOpenSong={mockSetOpenSong}
        setNextSong={mockSetNextSong}
      />
    );
    const { getAllByRole } = within(
      screen.getByRole('list', { name: /data/i })
    );
    const firstDeleteButton = getAllByRole('button', { name: /Delete/i })[0];
    fireEvent.click(firstDeleteButton);

    expect(mockDelete).toBeCalledWith(testLibrary[0].songId);
  });

  test('click song name should open popup', async () => {
    const mockSetPopup = jest.fn();
    const mockSetOpenSong = jest.fn();
    const mockSetNextSong = jest.fn();
    render(
      <SongLibrary
        setPopupTriggered={mockSetPopup}
        setOpenSong={mockSetOpenSong}
        setNextSong={mockSetNextSong}
      />
    );

    const song1button = screen.getByRole('button', {
      name: (content) => content.startsWith(testLibrary[0].songName),
    });
    fireEvent.click(song1button);

    expect(mockSetPopup).toBeCalledWith(true);
    expect(mockSetOpenSong).toBeCalledWith({
      ...testLibrary[0],
      songId: expect.any(String),
    });
  });
});

describe('SongItem', () => {
  const mockSet = jest.fn();
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      dialog: {
        openFile: jest
          .fn()
          .mockResolvedValueOnce(testSong2.songPath)
          .mockResolvedValueOnce(testSong2.lyricsPath),
      },
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          setSong: mockSet,
        },
      },
    };
  });

  test('song item should display song name, artist and paths', async () => {
    render(<SongComponent song={testSong} />);

    expect(screen.getByText(testSong.songName)).toBeInTheDocument();
    expect(screen.getByText(testSong.artist)).toBeInTheDocument();
    expect(screen.getByText(testSong.songPath)).toBeInTheDocument();
    expect(screen.getByText(testSong.lyricsPath)).toBeInTheDocument();
  });

  test('editing song details will update the database', async () => {
    render(<SongComponent song={testSong} />);

    const nameButton = screen.getByText(testSong.songName);
    fireEvent.click(nameButton);
    const nameInput = screen.getByRole('textbox');
    fireEvent.change(nameInput, { target: { value: testSong2.songName } });
    fireEvent.focusOut(nameInput);

    const artistButton = screen.getByText(testSong.artist);
    fireEvent.click(artistButton);
    const artistInput = screen.getByRole('textbox');
    fireEvent.change(artistInput, { target: { value: testSong2.artist } });
    fireEvent.focusOut(artistInput);

    const songPickerButton = screen.getByTestId('song-picker-button');
    fireEvent.click(songPickerButton);

    await waitFor(() =>
      expect(screen.getByText(testSong2.songPath)).toBeInTheDocument()
    );
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    fireEvent.click(lyricsPickerButton);

    await waitFor(() => expect(mockSet).toBeCalledWith(testSong2));
  });
});
