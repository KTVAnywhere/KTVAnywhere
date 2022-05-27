import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import mockedElectron from '../__testsData__/mocks';
import {
  songTestData,
  testLyrics,
  lineAt5s,
  lineAt10s,
} from '../__testsData__/testData';
import { Lyrics } from '../components/LyricsPlayer';
import { AudioPlayer } from '../components/AudioPlayer';

describe('Lyrics player component tests', () => {
  const mockSend = jest.fn();
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      file: {
        readSend: mockSend,
        readReceive: jest.fn(
          (
            callback: (err: NodeJS.ErrnoException | null, data: string) => void
          ) => {
            callback(null, testLyrics);
          }
        ),
      },
    };
  });
  test('should load the lyrics of song currently playing', () => {
    render(
      <Lyrics currentSong={songTestData[0]} currentTime={0} lyricsEnabled />
    );
    expect(mockSend).toBeCalledWith(songTestData[0].lyricsPath);
  });

  test('should display lyric line based on time', async () => {
    render(
      <Lyrics currentSong={songTestData[0]} currentTime={6} lyricsEnabled />
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(lineAt5s));
    await waitFor(() => expect(nextLine).toHaveTextContent(lineAt10s));
  });

  test('lyrics should not be displayed if disabled', async () => {
    render(
      <Lyrics
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
  HTMLMediaElement.prototype.pause = jest.fn();
  HTMLMediaElement.prototype.load = jest.fn();
  HTMLMediaElement.prototype.play = jest.fn();
  const mockSetCurrentTime = jest.fn();
  const mockSetCurrentSong = jest.fn();
  const mockSetLyricsEnabled = jest.fn();

  beforeEach(() => {
    global.window.electron = mockedElectron;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('should load first song in queue when play button is clicked, if no song is currently loaded', async () => {
    render(
      <AudioPlayer
        currentTime={0}
        setCurrentTime={mockSetCurrentTime}
        currentSong={null}
        setCurrentSong={mockSetCurrentSong}
        nextSong={null}
        setLyricsEnabled={mockSetLyricsEnabled}
      />
    );
    expect(mockSetCurrentSong).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(0);

    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);

    expect(mockSetCurrentSong).toBeCalledWith(songTestData[0]);
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(1);
  });

  test('should play current song when play song button is clicked', async () => {
    render(
      <AudioPlayer
        currentTime={0}
        setCurrentTime={mockSetCurrentTime}
        currentSong={null}
        setCurrentSong={mockSetCurrentSong}
        nextSong={null}
        setLyricsEnabled={mockSetLyricsEnabled}
      />
    );

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(0);
    // by default play button is displayed, to show the pause button, play button has to be clicked first
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    // implementation already called pause once when component is rendered
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  test('should pause current song when pause song button is clicked', async () => {
    render(
      <AudioPlayer
        currentTime={0}
        setCurrentTime={mockSetCurrentTime}
        currentSong={null}
        setCurrentSong={mockSetCurrentSong}
        nextSong={null}
        setLyricsEnabled={mockSetLyricsEnabled}
      />
    );

    // implementation already called pause once when component is rendered due to useEffect
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);

    // by default play button is displayed, to show the pause button, play button has to be clicked first
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    const pauseButton = screen.getByTestId('pause-button');
    fireEvent.click(pauseButton);

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(2);
  });

  test('should end current song when end song button is clicked and load next song in queue if available', async () => {
    render(
      <AudioPlayer
        currentTime={0}
        setCurrentTime={mockSetCurrentTime}
        currentSong={null}
        setCurrentSong={mockSetCurrentSong}
        nextSong={null}
        setLyricsEnabled={mockSetLyricsEnabled}
      />
    );

    const endSongButton = screen.getByTestId('end-song-button');

    // there are songs in queue
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(0);
    fireEvent.click(endSongButton);
    expect(mockSetCurrentSong).toBeCalledWith(songTestData[0]);
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(1);

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
    expect(mockSetCurrentSong.mock.calls[1][0]).toEqual(null);
    expect(mockSetCurrentTime).toBeCalledWith(0);
  });

  test('volume slider should change volume', async () => {
    let val: number;
    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
      get() {
        return val;
      },
      set(V) {
        val = V;
      },
    });
    render(
      <AudioPlayer
        currentTime={0}
        setCurrentTime={mockSetCurrentTime}
        currentSong={null}
        setCurrentSong={mockSetCurrentSong}
        nextSong={null}
        setLyricsEnabled={mockSetLyricsEnabled}
      />
    );
    const sliderInput = screen.getByTestId('volume-slider');
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
    expect(HTMLMediaElement.prototype.volume).toEqual(0.4);

    // set volume to 100
    fireEvent.mouseDown(sliderInput, {
      clientX: 100,
    });
    expect(HTMLMediaElement.prototype.volume).toEqual(1);
  });
});
