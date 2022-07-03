import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron, { mockedAudioStatus } from '../__testsData__/mocks';
import { Microphone, AudioStatusProvider } from '../components/AudioPlayer';
import { AlertMessageProvider } from '../components/AlertMessage';
import * as AudioStatusContext from '../components/AudioPlayer/AudioStatus.context';

describe('Microphone component test', () => {
  beforeEach(() => {
    global.window.electron = mockedElectron;
    global.window.AudioContext = AudioContext as any;
  });

  test('click microphone button should show microphone settings', async () => {
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    const mic1SettingsButton = screen.getByTestId('toggle-mic-1-settings-menu');
    fireEvent.click(mic1SettingsButton);
    expect(screen.getByText('mic 1 settings')).toBeInTheDocument();
  });

  test('microphone volume slider should change microphone volume', async () => {
    const mockGain = { value: 70 };
    const mockSetVolume = jest.fn();
    const mockGainNode = {
      ...new AudioContext().createGain(),
      gain: mockGain,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setMicrophone1Volume: mockSetVolume,
      microphone1GainNode: mockGainNode as any,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );
    // open microphone 1 settings menu
    const mic1SettingsButton = screen.getByTestId('toggle-mic-1-settings-menu');
    fireEvent.click(mic1SettingsButton);

    // get microphone 1 volume slider
    const sliderInput = screen.getByTestId('microphone-1-volume-slider');
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

    // set microphone 1 volume to 40
    fireEvent.mouseDown(sliderInput, {
      clientX: 40,
    });
    await waitFor(() => {
      expect(mockSetVolume).toBeCalledWith(40);
      expect(mockGain.value).toEqual(0.4);
    });

    // set microphone 1 volume to 100
    fireEvent.mouseDown(sliderInput, {
      clientX: 100,
    });
    await waitFor(() => {
      expect(mockSetVolume).toBeCalledWith(100);
      expect(mockGain.value).toEqual(1);
    });

    sliderInput.getBoundingClientRect = originalGetBoundingClientRect;
  });
});
