import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron from '../__testsData__/mocks';
import App from '../renderer/App';
import SettingsMenu from '../components/Settings';

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
    render(<SettingsMenu showSettings setShowSettings={mockSetShowSettings} />);
    const closeSettingsButton = screen.getByTestId('close-settings-button');
    fireEvent.click(closeSettingsButton);
    expect(mockSetShowSettings).toBeCalledWith(false);
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
    render(<SettingsMenu showSettings setShowSettings={jest.fn()} />);

    const colorThemeOptions = screen.getAllByRole('button')[0];
    fireEvent.mouseDown(colorThemeOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/ocean/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      colorThemeId: 1,
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
    render(<SettingsMenu showSettings setShowSettings={jest.fn()} />);

    const errorMessagesTimeoutOptions = screen.getAllByRole('button')[1];
    fireEvent.mouseDown(errorMessagesTimeoutOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/15s/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      errorMessagesTimeout: 15,
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
    render(<SettingsMenu showSettings setShowSettings={jest.fn()} />);

    const audioBufferSizeOptions = screen.getAllByRole('button')[2];
    fireEvent.mouseDown(audioBufferSizeOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/16 Kb/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      audioBufferSize: 16384,
    });
  });
});
