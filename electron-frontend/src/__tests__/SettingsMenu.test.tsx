import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron, { mockedAudioStatus } from '../__testsData__/mocks';
import App from '../renderer/App';
import SettingsMenu from '../components/Settings';
import * as AudioStatusContext from '../components/AudioPlayer/AudioStatus.context';
import { AudioStatusProvider } from '../components/AudioPlayer';

describe('Settings menu component test', () => {
  global.window.electron = mockedElectron;
  global.AudioContext = AudioContext as any;
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

  test('click settings button should show settings menu', async () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('click close settings button should close settings menu', async () => {
    const mockSetShowSettings = jest.fn();
    render(
      <SettingsMenu
        showSettings
        setShowSettings={mockSetShowSettings}
        setCurrentTheme={jest.fn()}
      />
    );
    const closeSettingsButton = screen.getByTestId('close-settings-button');
    fireEvent.click(closeSettingsButton);
    expect(mockSetShowSettings).toBeCalledWith(false);
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
        <SettingsMenu
          showSettings
          setShowSettings={jest.fn()}
          setCurrentTheme={jest.fn()}
        />
      </AudioStatusProvider>
    );

    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise1;
    });

    const microphone1Options = screen.getAllByRole('button')[0];
    fireEvent.mouseDown(microphone1Options);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/mic1/));

    expect(mockSetAudioInput1Id).toBeCalledWith(mockDevice1.deviceId);
  });

  test('change color theme', async () => {
    const mockSetSettings = jest.fn();
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        config: {
          ...mockedElectron.store.config,
          setSettings: mockSetSettings,
        },
      },
    };
    render(
      <SettingsMenu
        showSettings
        setShowSettings={jest.fn()}
        setCurrentTheme={jest.fn()}
      />
    );

    const colorThemeOptions = screen.getAllByRole('button')[2];
    fireEvent.mouseDown(colorThemeOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/ocean/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      colorThemeId: 1,
    });
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('change errorMessagesTimeout', async () => {
    const mockSetSettings = jest.fn();
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        config: {
          ...mockedElectron.store.config,
          setSettings: mockSetSettings,
        },
      },
    };
    render(
      <SettingsMenu
        showSettings
        setShowSettings={jest.fn()}
        setCurrentTheme={jest.fn()}
      />
    );

    const errorMessagesTimeoutOptions = screen.getAllByRole('button')[3];
    fireEvent.mouseDown(errorMessagesTimeoutOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/15s/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      errorMessagesTimeout: 15,
    });
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });

  test('change audio buffer size', async () => {
    const mockSetSettings = jest.fn();
    global.window.electron = {
      ...mockedElectron,
      store: {
        ...mockedElectron.store,
        config: {
          ...mockedElectron.store.config,
          setSettings: mockSetSettings,
        },
      },
    };
    render(
      <SettingsMenu
        showSettings
        setShowSettings={jest.fn()}
        setCurrentTheme={jest.fn()}
      />
    );

    const audioBufferSizeOptions = screen.getAllByRole('button')[4];
    fireEvent.mouseDown(audioBufferSizeOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/16 Kb/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      audioBufferSize: 16384,
    });
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });
});
