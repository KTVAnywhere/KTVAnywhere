import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
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
});
