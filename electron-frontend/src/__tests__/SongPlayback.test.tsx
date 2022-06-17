import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AudioContext, AudioBuffer } from 'standardized-audio-context-mock';
import mockedElectron from '../__testsData__/mocks';
import {
  songTestData,
  testLyrics,
  lineAt5s,
  lineAt10s,
} from '../__testsData__/testData';
import { AlertMessageProvider } from '../components/Alert.context';
import LyricsPlayer from '../components/LyricsPlayer';
import AudioPlayer from '../components/AudioPlayer';

describe('Lyrics player', () => {
  const mockRead = jest.fn().mockResolvedValue(testLyrics);
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      file: {
        read: mockRead,
        readAsBuffer: jest.fn(),
        ifFileExists: jest.fn(),
      },
    };
  });
  test('should load the lyrics of song currently playing', async () => {
    render(
      <LyricsPlayer
        currentSong={songTestData[0]}
        currentTime={0}
        lyricsEnabled
      />
    );
    await waitFor(() =>
      expect(mockRead).toBeCalledWith(songTestData[0].lyricsPath)
    );
  });

  test('should display lyric line based on time', async () => {
    render(
      <LyricsPlayer
        currentSong={songTestData[0]}
        currentTime={6}
        lyricsEnabled
      />
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(lineAt5s));
    await waitFor(() => expect(nextLine).toHaveTextContent(lineAt10s));
  });

  test('lyrics should not be displayed if disabled', async () => {
    render(
      <LyricsPlayer
        currentSong={songTestData[0]}
        currentTime={6}
        lyricsEnabled={false}
      />
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(''));
    await waitFor(() => expect(nextLine).toHaveTextContent(''));
  });
});

describe('Audio player component tests', () => {
  const mockSetCurrentTime = jest.fn();
  const mockSetCurrentSong = jest.fn();
  const mockSetLyricsEnabled = jest.fn();
  const mockGetSong = jest.fn();

  beforeEach(() => {
    global.window.AudioContext = AudioContext as any;
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        songs: {
          ...mockedElectron.store.songs,
          getSong: mockGetSong,
        },
      },
      file: {
        read: jest.fn(),
        readAsBuffer: jest
          .fn()
          .mockReturnValue(new AudioBuffer({ length: 10, sampleRate: 44100 })),
        ifFileExists: jest.fn().mockReturnValue(true),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should load first song in queue when play button is clicked, if no song is currently loaded', async () => {
    render(
      <AlertMessageProvider>
        <AudioPlayer
          currentTime={0}
          setCurrentTime={mockSetCurrentTime}
          currentSong={null}
          setCurrentSong={mockSetCurrentSong}
          nextSong={null}
          lyricsEnabled
          setLyricsEnabled={mockSetLyricsEnabled}
        />
      </AlertMessageProvider>
    );
    expect(mockGetSong).not.toHaveBeenCalled();

    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    await waitFor(() => {
      expect(mockGetSong).toBeCalled();
    });
  });

  test('should play currently paused song when play song button is clicked', async () => {
    render(
      <AlertMessageProvider>
        <AudioPlayer
          currentTime={0}
          setCurrentTime={mockSetCurrentTime}
          currentSong={null}
          setCurrentSong={mockSetCurrentSong}
          nextSong={null}
          lyricsEnabled
          setLyricsEnabled={mockSetLyricsEnabled}
        />
      </AlertMessageProvider>
    );

    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(0);
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    await waitFor(() => {
      expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(1);
    });
  });

  test('should pause current song when pause song button is clicked', async () => {
    render(
      <AlertMessageProvider>
        <AudioPlayer
          currentTime={0}
          setCurrentTime={mockSetCurrentTime}
          currentSong={null}
          setCurrentSong={mockSetCurrentSong}
          nextSong={null}
          lyricsEnabled
          setLyricsEnabled={mockSetLyricsEnabled}
        />
      </AlertMessageProvider>
    );

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(0);

    // by default play button is displayed, to show the pause button, play button has to be clicked first
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    const pauseButton = screen.getByTestId('pause-button');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    });
  });

  test('should end current song when end song button is clicked and load next song in queue if available', async () => {
    render(
      <AlertMessageProvider>
        <AudioPlayer
          currentTime={0}
          setCurrentTime={mockSetCurrentTime}
          currentSong={null}
          setCurrentSong={mockSetCurrentSong}
          nextSong={null}
          lyricsEnabled
          setLyricsEnabled={mockSetLyricsEnabled}
        />
      </AlertMessageProvider>
    );

    const endSongButton = screen.getByTestId('end-song-button');

    // there are songs in queue
    fireEvent.click(endSongButton);
    await waitFor(() => {
      expect(mockSetCurrentSong).toBeCalledWith(songTestData[0]);
    });

    // no song in queue
    const mockGetAllQueueItems = () => {
      return [];
    };

    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          getAllQueueItems: mockGetAllQueueItems,
        },
      },
    };

    fireEvent.click(endSongButton);
    await waitFor(() => {
      expect(mockSetCurrentSong.mock.calls[1][0]).toEqual(null);
      expect(mockSetCurrentTime).toBeCalledWith(0);
    });
  });

  test('volume slider should change volume', async () => {
    let audioVolume: number;
    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
      get() {
        return audioVolume;
      },
      set(V) {
        audioVolume = V;
      },
    });
    render(
      <AlertMessageProvider>
        <AudioPlayer
          currentTime={0}
          setCurrentTime={mockSetCurrentTime}
          currentSong={null}
          setCurrentSong={mockSetCurrentSong}
          nextSong={null}
          lyricsEnabled
          setLyricsEnabled={mockSetLyricsEnabled}
        />
      </AlertMessageProvider>
    );
    const sliderInput = screen.getByTestId('volume-slider');
    const originalGetBoundingClientRect = sliderInput.getBoundingClientRect;

    sliderInput.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 10,
      bottom: 10,
      left: 0,
      x: 0,
      y: 0,
      right: 0,
      top: 0,
      toJSON: jest.fn(),
    }));

    // set volume to 40
    fireEvent.mouseDown(sliderInput, {
      clientX: 40,
    });
    await waitFor(() => {
      expect(HTMLMediaElement.prototype.volume).toEqual(0.4);
    });

    // set volume to 100
    fireEvent.mouseDown(sliderInput, {
      clientX: 100,
    });
    await waitFor(() => {
      expect(HTMLMediaElement.prototype.volume).toEqual(1);
    });

    sliderInput.getBoundingClientRect = originalGetBoundingClientRect;
  });

  test('toggle vocals button should turn off vocals when clicked and when song accompanimentPath exist', async () => {
    const mockIfFileExists = jest.fn().mockReturnValue(true);
    window.electron.file.ifFileExists = mockIfFileExists;
    render(
      <AlertMessageProvider>
        <AudioPlayer
          currentTime={0}
          setCurrentTime={mockSetCurrentTime}
          currentSong={songTestData[1]}
          setCurrentSong={mockSetCurrentSong}
          nextSong={null}
          lyricsEnabled
          setLyricsEnabled={mockSetLyricsEnabled}
        />
      </AlertMessageProvider>
    );

    const toggleVocalsSwitch = screen.getByTestId('toggle-vocals-switch');
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    fireEvent.click(toggleVocalsSwitch);
    await waitFor(() => {
      expect(mockIfFileExists).toHaveBeenCalled();
      expect(HTMLMediaElement.prototype.load).toHaveBeenCalled();
    });
  });
});
