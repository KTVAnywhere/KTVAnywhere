import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron, { mockedAudioStatus } from '../__testsData__/mocks';
import { AudioStatusProvider } from '../components/AudioStatus.context';
import Microphone from '../components/Microphone';
import { AlertMessageProvider } from '../components/AlertMessage';
import * as AudioStatusContext from '../components/AudioStatus.context';

describe('Microphone component test', () => {
  global.window.electron = mockedElectron;
  global.window.AudioContext = AudioContext as any;
  const mediaDevicesPromise = Promise.resolve([]);

  beforeEach(() => {
    const mockEnumerateDevices = jest.fn(() => mediaDevicesPromise);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: mockEnumerateDevices,
      },
    });
  });

  test('click microphone button should show microphone settings', async () => {
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

    expect(screen.getAllByText('Microphone')[0]).toBeInTheDocument();
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('change microphone input', async () => {
    const mockDevice0: MediaDeviceInfo = {
      deviceId: 'default',
      groupId: '',
      kind: 'audioinput',
      label: 'mic0',
      toJSON: () => {},
    };
    const mockDevice1: MediaDeviceInfo = {
      deviceId: 'mic1',
      groupId: '',
      kind: 'audioinput',
      label: 'mic1',
      toJSON: () => {},
    };
    const mediaDevicesPromise1 = Promise.resolve([mockDevice0, mockDevice1]);
    const mockEnumerateDevices1 = jest.fn(() => mediaDevicesPromise1);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: mockEnumerateDevices1,
      },
    });
    const mockSetAudioInput1Id = jest.fn();
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setAudioInput1Id: mockSetAudioInput1Id,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise1;
    });

    const microphone1Options = screen.getAllByRole('button')[2];
    fireEvent.mouseDown(microphone1Options);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/mic1/));

    expect(mockSetAudioInput1Id).toBeCalledWith(mockDevice1.deviceId);
  });

  test('toggle microphone switch off (initially on) should disable microphone', async () => {
    const mockSetMicrophone1Enabled = jest.fn();
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      microphone1Enabled: true,
      setMicrophone1Enabled: mockSetMicrophone1Enabled,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

    // switch off
    const microphone1ToggleSwitch = screen.getByTestId(
      'toggle-microphone-1-switch'
    );
    fireEvent.click(microphone1ToggleSwitch);

    expect(mockSetMicrophone1Enabled).toHaveBeenCalledWith(false);
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('toggle reverb switch off (initially on) should disable reverb', async () => {
    const mockSetReverb1Enabled = jest.fn();
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      reverb1Enabled: true,
      setReverb1Enabled: mockSetReverb1Enabled,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

    // switch off
    const reverb1ToggleSwitch = screen.getByTestId('toggle-reverb-1-switch');
    fireEvent.click(reverb1ToggleSwitch);

    expect(mockSetReverb1Enabled).toHaveBeenCalledWith(false);
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('microphone volume slider should change microphone volume', async () => {
    const mockGain = { value: 70 };
    const mockSetMicrophoneVolume = jest.fn();
    const mockGainNode = {
      ...new AudioContext().createGain(),
      gain: mockGain,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setMicrophone1Volume: mockSetMicrophoneVolume,
      microphone1GainNode: mockGainNode as any,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

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
      expect(mockSetMicrophoneVolume).toBeCalledWith(40);
      expect(mockGain.value).toEqual(0.4);
    });

    // set microphone 1 volume to 100
    fireEvent.mouseDown(sliderInput, {
      clientX: 100,
    });
    await waitFor(() => {
      expect(mockSetMicrophoneVolume).toBeCalledWith(100);
      expect(mockGain.value).toEqual(1);
    });

    sliderInput.getBoundingClientRect = originalGetBoundingClientRect;
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('microphone reverb slider should change reverb volume', async () => {
    const mockGain = { value: 70 };
    const mockSetReverbVolume = jest.fn();
    const mockGainNode = {
      ...new AudioContext().createGain(),
      gain: mockGain,
    };
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      setReverb1Volume: mockSetReverbVolume,
      reverb1GainNode: mockGainNode as any,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

    // get microphone 1 reverb slider
    const sliderInput = screen.getByTestId('microphone-1-reverb-slider');
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

    // set microphone 1 reverb to 40
    fireEvent.mouseDown(sliderInput, {
      clientX: 40,
    });
    await waitFor(() => {
      expect(mockSetReverbVolume).toBeCalledWith(40);
      expect(mockGain.value).toEqual(0.4);
    });

    // set microphone 1 reverb to 100
    fireEvent.mouseDown(sliderInput, {
      clientX: 100,
    });
    await waitFor(() => {
      expect(mockSetReverbVolume).toBeCalledWith(100);
      expect(mockGain.value).toEqual(1);
    });

    sliderInput.getBoundingClientRect = originalGetBoundingClientRect;
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('click restore microphone defaults button should restore defaults', async () => {
    const mockSetAudioInputId = jest.fn();
    const mockSetMicrophoneVolume = jest.fn();
    const mockSetReverbVolume = jest.fn();
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      audioInput1Id: 'not-default',
      setAudioInput1Id: mockSetAudioInputId,
      microphone1Volume: 80,
      setMicrophone1Volume: mockSetMicrophoneVolume,
      reverb1Volume: 40,
      setReverb1Volume: mockSetReverbVolume,
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);

    // click restore defaults for mic 1
    const restoreMicrophone1Defaults = screen.getByTestId(
      'restore-microphone-1-defaults-button'
    );
    fireEvent.click(restoreMicrophone1Defaults);

    expect(mockSetAudioInputId).toHaveBeenCalledWith('default');
    expect(mockSetMicrophoneVolume).toHaveBeenCalledWith(50);
    expect(mockSetReverbVolume).toHaveBeenCalledWith(50);
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('click refresh audio input devices button should call to obtain all audio input devices', async () => {
    const mockEnumerateDevices = jest.fn(() => mediaDevicesPromise);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: mockEnumerateDevices,
      },
    });
    render(
      <AudioStatusProvider>
        <AlertMessageProvider>
          <Microphone />
        </AlertMessageProvider>
      </AudioStatusProvider>
    );

    // open microphone settings menu
    const micSettingsButton = screen.getByTestId('toggle-mic-settings-menu');
    fireEvent.click(micSettingsButton);
    expect(mockEnumerateDevices).toHaveBeenCalledTimes(1);

    // click restore defaults for mic 1
    const refreshAudioInputDevicesButton = screen.getByTestId(
      'refresh-audio-input-devices-button'
    );
    fireEvent.click(refreshAudioInputDevicesButton);

    expect(mockEnumerateDevices).toHaveBeenCalledTimes(2);
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });
});
