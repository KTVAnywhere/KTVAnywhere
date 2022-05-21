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

describe('SongUpload', () => {
  beforeEach(() => {
    global.window.electron = {
      ...window.electron,
      dialog: {
        openFile: jest
          .fn()
          .mockResolvedValueOnce(testSong.songPath)
          .mockResolvedValueOnce(testSong.lyricsPath)
          .mockResolvedValueOnce(testSong2.songPath)
          .mockResolvedValueOnce(testSong2.lyricsPath),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('song picker should set input value to name of file', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
    const songPickerButton = screen.getByTestId('song-picker-button');
    const songPickerInput = screen.getByTestId('song-picker-input');
    fireEvent.click(songPickerButton);

    await waitFor(() => expect(songPickerInput).toHaveValue('file.mp3'));
  });

  test('song object should be returned on submit', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
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

    await waitFor(() =>
      expect(mockFn.mock.calls[0][0]([])).toContainEqual(testSong)
    );
  });

  test('submitting new songs should not override previous array', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
    const songNameInput = screen.getByTestId('song-name-input');
    const artistInput = screen.getByTestId('artist-input');
    const songPickerButton = screen.getByTestId('song-picker-button');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    // Test Song 1
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

    // Test song 2
    fireEvent.change(songNameInput, { target: { value: testSong2.songName } });
    fireEvent.change(artistInput, { target: { value: testSong2.artist } });
    fireEvent.click(songPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('song-picker-input')).toHaveValue()
    );
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('lyrics-picker-input')).toHaveValue()
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFn.mock.calls[0][0]([])).toContainEqual(testSong);
      expect(mockFn.mock.calls[1][0]([])).toContainEqual(testSong2);
    });
  });

  test('form should not submit if song name is not filled in', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
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
        'lyrics.lrc'
      )
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockFn).toBeCalledTimes(0));
  });

  test('form should not submit if song is not picked', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
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

    await waitFor(() => expect(mockFn).toBeCalledTimes(0));
  });
});

describe('SongLibrary', () => {
  test('song library should display list of songs', async () => {
    const mockSetPopup = jest.fn();
    const mockSetOpenSong = jest.fn();
    const mockFn = jest.fn();
    render(
      <SongLibrary
        songs={testLibrary}
        setPopupTriggered={mockSetPopup}
        setOpenSong={mockSetOpenSong}
        queue={[]}
        setQueue={mockFn}
      />
    );
    const { getAllByRole } = within(
      screen.getByRole('rowgroup', { name: /data/i })
    );

    expect(getAllByRole('row').length).toEqual(2);
  });

  test('click song name should open popup', async () => {
    const mockSetPopup = jest.fn();
    const mockSetOpenSong = jest.fn();
    const mockFn = jest.fn();
    render(
      <SongLibrary
        songs={testLibrary}
        setPopupTriggered={mockSetPopup}
        setOpenSong={mockSetOpenSong}
        queue={[]}
        setQueue={mockFn}
      />
    );

    const song1button = screen.getByRole('button', {
      name: testLibrary[0].songName,
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
  test('song item should display song name, artist and paths', async () => {
    render(<SongComponent song={testSong} />);

    expect(screen.getByText(testSong.songName)).toBeInTheDocument();
    expect(screen.getByText(testSong.artist)).toBeInTheDocument();
    expect(screen.getByText(testSong.songPath)).toBeInTheDocument();
    expect(screen.getByText(testSong.lyricsPath)).toBeInTheDocument();
  });
});
