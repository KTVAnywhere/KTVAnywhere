import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Lrc, Runner } from 'lrc-kit';
import { AudioContext, AudioBuffer } from 'standardized-audio-context-mock';
import mockedElectron, { mockedAudioStatus } from '../__testsData__/mocks';
import {
  songTestData,
  testLyrics,
  lineAt5s,
  lineAt10s,
} from '../__testsData__/testData';
import { AlertMessageProvider } from '../components/AlertMessage';
import LyricsPlayer, {
  LyricsAdjust,
  LyricsProvider,
} from '../components/LyricsPlayer';
import AudioPlayer, { AudioStatusProvider } from '../components/AudioPlayer';
import * as AudioStatusContext from '../components/AudioPlayer/AudioStatus.context';
import * as LyricsContext from '../components/LyricsPlayer/Lyrics.context';

describe('Lyrics player', () => {
  let mockRead = jest.fn().mockResolvedValue(testLyrics);
  beforeEach(() => {
    mockRead = jest.fn().mockResolvedValue(testLyrics);
    global.window.AudioContext = AudioContext as any;
    global.window.electron = {
      ...mockedElectron,
      file: {
        ...mockedElectron.file,
        read: mockRead,
        readAsBuffer: jest.fn(),
        ifFileExists: jest.fn().mockReturnValue(true),
      },
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('should load the lyrics of song currently playing', async () => {
    jest
      .spyOn(AudioStatusContext, 'useAudioStatus')
      .mockReturnValue({ ...mockedAudioStatus, currentSong: songTestData[0] });
    render(
      <AudioStatusProvider>
        <LyricsProvider>
          <LyricsPlayer />
        </LyricsProvider>
      </AudioStatusProvider>
    );
    await waitFor(() =>
      expect(mockRead).toBeCalledWith(songTestData[0].lyricsPath)
    );
  });

  test('should display lyric line based on time', async () => {
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentTime: 6,
      currentSong: songTestData[0],
    });
    render(
      <AudioStatusProvider>
        <LyricsProvider>
          <LyricsPlayer />
        </LyricsProvider>
      </AudioStatusProvider>
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(lineAt5s));
    await waitFor(() => expect(nextLine).toHaveTextContent(lineAt10s));
  });

  test('lyrics should not be displayed if disabled', async () => {
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentTime: 6,
      currentSong: songTestData[0],
      lyricsEnabled: false,
    });
    render(
      <AudioStatusProvider>
        <LyricsProvider>
          <LyricsPlayer />
        </LyricsProvider>
      </AudioStatusProvider>
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(''));
    await waitFor(() => expect(nextLine).toHaveTextContent(''));
  });
});

describe('Lyrics adjust', () => {
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  test('click plus and minus button should change the offset by 0.2', () => {
    const mockSet = jest.fn();
    jest.spyOn(LyricsContext, 'useLyrics').mockReturnValue({
      lyricsRunner: new Runner(Lrc.parse('')),
      setLyricsRunner: mockSet,
    });
    render(
      <LyricsProvider>
        <LyricsAdjust />
      </LyricsProvider>
    );

    const offsetField = screen.getByTestId('offset');
    const minusButton = screen.getByRole('button', { name: /stepDown/i });
    const plusButton = screen.getByRole('button', { name: /stepUp/i });

    expect(offsetField).toHaveValue(0);
    fireEvent.click(minusButton);
    expect(offsetField).toHaveValue(-0.2);
    fireEvent.click(plusButton);
    expect(offsetField).toHaveValue(0);
    expect(mockSet).toBeCalledTimes(2);
  });

  test('click tick button should update lyrics file', async () => {
    const mockWrite = jest.fn().mockResolvedValue({});
    global.window.electron = {
      ...mockedElectron,
      file: {
        ...mockedElectron.file,
        write: mockWrite,
      },
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentSong: songTestData[0],
    });

    render(
      <AlertMessageProvider>
        <LyricsProvider>
          <LyricsAdjust />
        </LyricsProvider>
      </AlertMessageProvider>
    );

    const tickButton = screen.getByRole('button', { name: /saveOffset/i });

    fireEvent.click(tickButton);
    await waitFor(() => expect(mockWrite).toBeCalled());
  });
});

describe('Audio player component tests', () => {
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
        ...mockedElectron.file,
        read: jest.fn(),
        readAsBuffer: jest
          .fn()
          .mockReturnValue(new AudioBuffer({ length: 10, sampleRate: 44100 })),
        ifFileExists: jest.fn().mockReturnValue(true),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('should load first song in queue when play button is clicked, if no song is currently loaded', async () => {
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );
    expect(mockGetSong).not.toHaveBeenCalled();

    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    await waitFor(() => {
      expect(mockGetSong).toBeCalled();
    });
  });

  test('should play currently paused song when play song button is clicked', async () => {
    const mockSetIsPlaying = jest.fn();
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    expect(mockSetIsPlaying).toHaveBeenCalledTimes(0);
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    await waitFor(() => {
      expect(mockSetIsPlaying).toHaveBeenCalledTimes(1);
      expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
    });
  });

  test('should pause current song when pause song button is clicked', async () => {
    const mockSetIsPlaying = jest.fn();
    const mockDisconnect = jest.fn();
    const mockGainNode = {
      ...new AudioContext().createGain(),
      disconnect: mockDisconnect,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      isPlaying: true,
      setIsPlaying: mockSetIsPlaying,
      gainNode: mockGainNode as any,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    expect(mockSetIsPlaying).toHaveBeenCalledTimes(0);
    expect(mockDisconnect).not.toHaveBeenCalled();

    const pauseButton = screen.getByTestId('pause-button');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockSetIsPlaying).toHaveBeenCalledTimes(1);
      expect(mockSetIsPlaying).toBeCalledWith(false);
    });
  });

  test('should end current song when end song button is clicked and load next song in queue if available', async () => {
    const mockSetCurrentSong = jest.fn();
    const mockSetCurrentTime = jest.fn();
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setCurrentSong: mockSetCurrentSong,
      setCurrentTime: mockSetCurrentTime,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    const endSongButton = screen.getByTestId('end-song-button');

    expect(mockGetSong).not.toBeCalled();
    // there are songs in queue
    fireEvent.click(endSongButton);
    await waitFor(() => {
      expect(mockGetSong).toBeCalled();
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
      expect(mockSetCurrentSong.mock.calls[0][0]).toEqual(null);
      expect(mockSetCurrentTime).toBeCalledWith(0);
    });
  });

  test('volume slider should change volume', async () => {
    const mockGain = { value: 70 };
    const mockSetVolume = jest.fn();
    const mockGainNode = {
      ...new AudioContext().createGain(),
      gain: mockGain,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setVolume: mockSetVolume,
      gainNode: mockGainNode as any,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
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
      expect(mockSetVolume).toBeCalledWith(40);
      expect(mockGain.value).toEqual(0.4);
    });

    // set volume to 100
    fireEvent.mouseDown(sliderInput, {
      clientX: 100,
    });
    await waitFor(() => {
      expect(mockSetVolume).toBeCalledWith(100);
      expect(mockGain.value).toEqual(1);
    });

    sliderInput.getBoundingClientRect = originalGetBoundingClientRect;
  });

  test('toggle vocals button should turn off vocals when clicked and when song accompanimentPath exist', async () => {
    const mockIfFileExists = jest.fn().mockReturnValue(true);
    window.electron.file.ifFileExists = mockIfFileExists;
    const mockReadAsBuffer = jest.fn();
    window.electron.file.readAsBuffer = mockReadAsBuffer;
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentSong: songTestData[2],
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    const toggleVocalsSwitch = screen.getByTestId('toggle-vocals-switch');
    expect(mockIfFileExists).toHaveBeenCalledTimes(1);
    expect(mockReadAsBuffer).toHaveBeenCalledTimes(1);
    fireEvent.click(toggleVocalsSwitch);
    await waitFor(() => {
      expect(mockIfFileExists).toHaveBeenCalledTimes(2);
      expect(mockReadAsBuffer).toHaveBeenCalledTimes(2);
    });
  });

  test('pitch slider should change pitch', async () => {
    const mockSetPitch = jest.fn();
    const mockSource = {
      pitchSemitones: 0,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setPitch: mockSetPitch,
      source: mockSource,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );
    const sliderInput = screen.getByTestId('pitch-slider');
    const originalGetBoundingClientRect = sliderInput.getBoundingClientRect;

    sliderInput.getBoundingClientRect = jest.fn(() => ({
      width: 140,
      height: 10,
      bottom: 10,
      left: 0,
      x: 0,
      y: 0,
      right: 0,
      top: 0,
      toJSON: jest.fn(),
    }));

    // set pitch to -3.5
    fireEvent.mouseDown(sliderInput, {
      clientX: 0,
    });
    await waitFor(() => {
      expect(mockSetPitch).toBeCalledWith(-3.5);
      expect(mockSource.pitchSemitones).toEqual(-3.5);
    });

    // set pitch to 0.5
    fireEvent.mouseDown(sliderInput, {
      clientX: 80,
    });
    await waitFor(() => {
      expect(mockSetPitch).toBeCalledWith(0.5);
      expect(mockSource.pitchSemitones).toEqual(0.5);
    });

    sliderInput.getBoundingClientRect = originalGetBoundingClientRect;
  });
});
