import '@testing-library/jest-dom';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import SongUploadForm, {
  SongStagingDialog,
  SongStagingDialogProvider,
  SongUploadButton,
} from '../components/SongUpload';
import * as SongStagingDialogContext from '../components/SongUpload/SongStagingDialog.context';
import { songListTestData, songTestData } from '../__testsData__/testData';
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
    render(
      <SongStagingDialogProvider>
        <SongUploadButton setUploadedSongs={jest.fn()} />
      </SongStagingDialogProvider>
    );
    const songUploadButton = screen.getByRole('button');
    fireEvent.click(songUploadButton);

    await waitFor(() =>
      expect(mockGetSongDetails).toBeCalledWith([
        songTestData[0].songPath,
        songTestData[1].songPath,
      ])
    );
  });

  test('should return the list of chosen songs', async () => {
    const mockSetSong = jest.fn();
    const mockSetOpen = jest.fn();
    jest
      .spyOn(SongStagingDialogContext, 'useSongStagingDialog')
      .mockReturnValue({ open: false, setOpen: mockSetOpen });
    render(
      <SongStagingDialogProvider>
        <SongUploadButton setUploadedSongs={mockSetSong} />
      </SongStagingDialogProvider>
    );
    const songUploadButton = screen.getByRole('button');
    fireEvent.click(songUploadButton);
    const expectedResult = songTestData.map((song) => ({
      ...song,
      lyricsPath: expect.any(String),
    }));

    await waitFor(() => expect(mockGetSongDetails).toBeCalled());
    await waitFor(() => expect(mockSetSong).toBeCalledWith(expectedResult));
    expect(mockSetOpen).toBeCalledWith(true);
  });
});

describe('SongStagingDialog', () => {
  const mockAdd = jest.fn();
  const mockSetOpen = jest.fn();
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          addSongs: mockAdd,
        },
      },
    };

    jest
      .spyOn(SongStagingDialogContext, 'useSongStagingDialog')
      .mockReturnValue({ open: true, setOpen: mockSetOpen });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should display the list of chosen songs', () => {
    render(
      <SongStagingDialogProvider>
        <SongStagingDialog
          uploadedSongs={songListTestData}
          setUploadedSongs={jest.fn()}
        />
      </SongStagingDialogProvider>
    );
    const { getAllByRole } = within(screen.getByRole('list'));

    expect(getAllByRole('listitem').length).toEqual(songListTestData.length);
  });

  test('click upload songs button should add songs to database', async () => {
    render(
      <SongStagingDialogProvider>
        <SongStagingDialog
          uploadedSongs={songListTestData}
          setUploadedSongs={jest.fn()}
        />
      </SongStagingDialogProvider>
    );
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    await waitFor(() =>
      expect(mockAdd).toBeCalledWith(songListTestData, expect.any(Boolean))
    );
  });

  test('click delete button should remove the song from the list', () => {
    const mockSet = jest.fn();
    render(
      <SongStagingDialogProvider>
        <SongStagingDialog
          uploadedSongs={songListTestData}
          setUploadedSongs={mockSet}
        />
      </SongStagingDialogProvider>
    );
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(mockSet.mock.calls[0][0](songListTestData)).toEqual(
      songListTestData.slice(1)
    );
  });

  test('edit song should edit song in the list', () => {
    const mockSet = jest.fn();
    render(
      <SongStagingDialogProvider>
        <SongStagingDialog
          uploadedSongs={songListTestData}
          setUploadedSongs={mockSet}
        />
      </SongStagingDialogProvider>
    );
    const editNameButtons = screen.getAllByTestId('edit-name');
    fireEvent.click(editNameButtons[0]);
    const nameInput = screen.getByRole('textbox');
    fireEvent.change(nameInput, {
      target: { value: songTestData[2].songName },
    });
    fireEvent.focusOut(nameInput);
    expect(
      screen.queryByText(songListTestData[0].songName)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(songTestData[2].songName)).toBeInTheDocument();
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
