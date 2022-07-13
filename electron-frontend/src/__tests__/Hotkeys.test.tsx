import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudioContext, AudioBuffer } from 'standardized-audio-context-mock';
import mockedElectron, { mockedAudioStatus } from '../__testsData__/mocks';
import { songTestData } from '../__testsData__/testData';
import { AlertMessageProvider } from '../components/AlertMessage';
import AudioPlayer from '../components/AudioPlayer';
import { AudioStatusProvider } from '../components/AudioStatus.context';
import * as AudioStatusContext from '../components/AudioStatus.context';

describe('Hotkey tests', () => {
  const mockDequeueItem = jest.fn().mockReturnValue(songTestData[0]);

  beforeEach(() => {
    global.window.AudioContext = AudioContext as any;
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        queueItems: {
          ...mockedElectron.store.queueItems,
          dequeueItem: mockDequeueItem,
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

  test('Space hotkey should play currently paused song when play song button is clicked', async () => {
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
    userEvent.keyboard('[Space]');
    await waitFor(() => {
      expect(mockSetIsPlaying).toHaveBeenCalledTimes(1);
      expect(mockSetIsPlaying).toHaveBeenCalledWith(true);
    });
  });

  test('Space hotkey should pause current song when pause song button is clicked', async () => {
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

    userEvent.keyboard('[Space]');
    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockSetIsPlaying).toHaveBeenCalledTimes(1);
      expect(mockSetIsPlaying).toBeCalledWith(false);
    });
  });

  test('up and down arrow should change volume', async () => {
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
    const audioPlayer = screen.getByTestId('audio-player');
    userEvent.type(audioPlayer, '[ArrowUp]');
    await waitFor(() => {
      expect(mockSetVolume).toBeCalledWith(75);
      expect(mockGain.value).toEqual(0.75);
    });

    userEvent.type(audioPlayer, '[ArrowDown]');
    await waitFor(() => {
      expect(mockSetVolume).toBeCalledWith(65);
      expect(mockGain.value).toEqual(0.65);
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
    const audioPlayer = screen.getByTestId('audio-player');
    userEvent.type(audioPlayer, '{Shift>}{ArrowUp}{/Shift}');
    await waitFor(() => {
      expect(mockSetPitch).toBeCalledWith(0.5);
      expect(mockSource.pitchSemitones).toEqual(0.5);
    });
    userEvent.type(audioPlayer, '{Shift>}{ArrowDown}{/Shift}');

    await waitFor(() => {
      expect(mockSetPitch).toBeCalledWith(-0.5);
      expect(mockSource.pitchSemitones).toEqual(-0.5);
    });
  });

  test('tempo slider should change tempo', async () => {
    const mockSetTempo = jest.fn();
    const mockSource = {
      tempo: 1,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setTempo: mockSetTempo,
      source: mockSource,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <AudioPlayer />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );
    const audioPlayer = screen.getByTestId('audio-player');
    userEvent.type(audioPlayer, '{Shift>}{ArrowLeft}{/Shift}');

    await waitFor(() => {
      expect(mockSetTempo).toBeCalledWith(0.9);
      expect(mockSource.tempo).toEqual(0.9);
    });

    userEvent.type(audioPlayer, '{Shift>}{ArrowRight}{/Shift}');

    await waitFor(() => {
      expect(mockSetTempo).toBeCalledWith(1.1);
      expect(mockSource.tempo).toEqual(1.1);
    });
  });
});
