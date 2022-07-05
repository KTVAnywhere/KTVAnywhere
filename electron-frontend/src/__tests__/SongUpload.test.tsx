import '@testing-library/jest-dom';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { SongsStatusProvider } from '../components/Song';
import {
  SongStagingDialog,
  SongStagingDialogProvider,
  SongUploadButton,
} from '../components/SongUpload';
import * as SongStagingDialogContext from '../components/SongUpload/SongStagingDialog.context';
import {
  ConfirmationDialog,
  ConfirmationProvider,
} from '../components/ConfirmationDialog';
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
        ...mockedElectron.preprocess,
        getSongDetails: mockGetSongDetails,
      },
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getSongDetails should be called with array of song paths', async () => {
    render(
      <SongsStatusProvider>
        <SongStagingDialogProvider>
          <SongUploadButton setUploadedSongs={jest.fn()} />
        </SongStagingDialogProvider>
      </SongsStatusProvider>
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
      <SongsStatusProvider>
        <SongStagingDialogProvider>
          <SongUploadButton setUploadedSongs={mockSetSong} />
        </SongStagingDialogProvider>
      </SongsStatusProvider>
    );
    const songUploadButton = screen.getByRole('button');
    fireEvent.click(songUploadButton);
    const expectedResult = songTestData.map((song) => ({
      ...song,
      lyricsPath: expect.any(String),
      vocalsPath: expect.any(String),
      accompanimentPath: expect.any(String),
      graphPath: expect.any(String),
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
      <SongsStatusProvider>
        <SongStagingDialogProvider>
          <SongStagingDialog
            uploadedSongs={songListTestData}
            setUploadedSongs={jest.fn()}
          />
        </SongStagingDialogProvider>
      </SongsStatusProvider>
    );
    const { getAllByRole } = within(screen.getByRole('list'));

    expect(getAllByRole('listitem').length).toEqual(songListTestData.length);
  });

  test('click cancel button bring up confirmation dialog', () => {
    render(
      <ConfirmationProvider>
        <SongsStatusProvider>
          <SongStagingDialogProvider>
            <SongStagingDialog
              uploadedSongs={songListTestData}
              setUploadedSongs={jest.fn()}
            />
            <ConfirmationDialog />
          </SongStagingDialogProvider>
        </SongsStatusProvider>
      </ConfirmationProvider>
    );
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.getByText('Cancel upload')).toBeInTheDocument();
  });

  test('click upload songs button should add songs to database', async () => {
    render(
      <ConfirmationProvider>
        <SongsStatusProvider>
          <SongStagingDialogProvider>
            <SongStagingDialog
              uploadedSongs={songListTestData}
              setUploadedSongs={jest.fn()}
            />
            <ConfirmationDialog />
          </SongStagingDialogProvider>
        </SongsStatusProvider>
      </ConfirmationProvider>
    );
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    const declineButton = screen.getByRole('button', { name: /No/i });
    fireEvent.click(declineButton);
    await waitFor(() =>
      expect(mockAdd).toBeCalledWith(songListTestData, expect.any(Boolean))
    );
  });

  test('click delete button should remove the song from the list', () => {
    const mockSet = jest.fn();
    render(
      <SongsStatusProvider>
        <SongStagingDialogProvider>
          <SongStagingDialog
            uploadedSongs={songListTestData}
            setUploadedSongs={mockSet}
          />
        </SongStagingDialogProvider>
      </SongsStatusProvider>
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
      <SongsStatusProvider>
        <SongStagingDialogProvider>
          <SongStagingDialog
            uploadedSongs={songListTestData}
            setUploadedSongs={mockSet}
          />
        </SongStagingDialogProvider>
      </SongsStatusProvider>
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
