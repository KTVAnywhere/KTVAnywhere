import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SongUploadForm, { SongUploadButton } from '../components/SongUpload';
import { songTestData } from '../__testsData__/testData';
import mockedElectron from '../__testsData__/mocks';

describe('SongUploadButton', () => {
  const mockAdd = jest.fn();
  const mockGetSongDetails = jest.fn().mockResolvedValue(songTestData);
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      dialog: {
        openFiles: jest
          .fn()
          .mockResolvedValue([
            songTestData[0].songPath,
            songTestData[1].songPath,
          ]),
        openFile: jest.fn(),
      },
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          addSongs: mockAdd,
        },
      },
      preprocess: {
        getSongDetails: mockGetSongDetails,
      },
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getSongDetails should be called with array of song paths', async () => {
    render(<SongUploadButton />);
    const songUploadButton = screen.getByRole('button');
    fireEvent.click(songUploadButton);

    await waitFor(() =>
      expect(mockGetSongDetails).toBeCalledWith([
        songTestData[0].songPath,
        songTestData[1].songPath,
      ])
    );
  });

  test('databse addSongs function should be called with song details returned from getSongDetails', async () => {
    render(<SongUploadButton />);
    const songUploadButton = screen.getByRole('button');
    fireEvent.click(songUploadButton);
    const expectedResult = songTestData.map((song) => ({
      ...song,
      lyricsPath: expect.any(String),
    }));

    await waitFor(() => expect(mockGetSongDetails).toBeCalled());
    await waitFor(() => expect(mockAdd).toBeCalledWith(expectedResult, true));
  });
});

describe('SongUploadForm', () => {
  const mockAdd = jest.fn();
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      dialog: {
        openFiles: jest.fn(),
        openFile: jest
          .fn()
          .mockResolvedValueOnce(songTestData[0].songPath)
          .mockResolvedValueOnce(songTestData[0].lyricsPath)
          .mockResolvedValueOnce(songTestData[1].songPath)
          .mockResolvedValueOnce(songTestData[1].lyricsPath),
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
    render(<SongUploadForm />);
    const songPickerButton = screen.getByTestId('song-picker-button');
    const songPickerInput = screen.getByTestId('song-picker-input');
    fireEvent.click(songPickerButton);

    await waitFor(() =>
      expect(songPickerInput).toHaveValue('bensound-energy.mp3')
    );
  });

  test('song object should be returned on submit', async () => {
    render(<SongUploadForm />);
    const songNameInput = screen.getByTestId('song-name-input');
    const artistInput = screen.getByTestId('artist-input');
    const songPickerButton = screen.getByTestId('song-picker-button');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    fireEvent.change(songNameInput, {
      target: { value: songTestData[0].songName },
    });
    fireEvent.change(artistInput, {
      target: { value: songTestData[0].artist },
    });
    fireEvent.click(songPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('song-picker-input')).toHaveValue()
    );
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('lyrics-picker-input')).toHaveValue()
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockAdd).toBeCalledWith(songTestData[0]));
  });

  test('form should not submit if song name is not filled in', async () => {
    render(<SongUploadForm />);
    const artistInput = screen.getByTestId('artist-input');
    const songPickerButton = screen.getByTestId('song-picker-button');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    fireEvent.change(artistInput, {
      target: { value: songTestData[0].artist },
    });
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
    render(<SongUploadForm />);
    const songNameInput = screen.getByTestId('song-name-input');
    const artistInput = screen.getByTestId('artist-input');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');
    const submitButton = screen.getByRole('button', { name: /Upload/i });

    fireEvent.change(songNameInput, {
      target: { value: songTestData[0].songName },
    });
    fireEvent.change(artistInput, {
      target: { value: songTestData[0].artist },
    });
    fireEvent.click(lyricsPickerButton);
    await waitFor(() =>
      expect(screen.getByTestId('lyrics-picker-input')).toHaveValue()
    );
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockAdd).toBeCalledTimes(0));
  });
});
