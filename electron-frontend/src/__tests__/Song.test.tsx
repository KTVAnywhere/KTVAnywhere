import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { SongProps } from 'components/SongItem';
import SongUpload from '../components/SongUpload';

const testSong: SongProps = {
  songId: expect.any(String),
  songName: 'Test song',
  artist: 'Test artist',
  songPath: 'C:\\dir\\file.mp3',
  lyricsPath: 'C:\\dir\\lyrics.lrc',
};

const testSong2: SongProps = {
  songId: expect.any(String),
  songName: 'Test song 2',
  artist: 'Test artist 2',
  songPath: 'C:\\dir\\file2.mp3',
  lyricsPath: 'C:\\dir\\lyrics2.lrc',
};

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
