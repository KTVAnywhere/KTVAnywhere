import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron from '../__testsData__/mocks';
import App from '../renderer/App';
import SettingsMenu from '../components/Settings';

describe('Settings menu component test', () => {
  global.window.electron = mockedElectron;
  global.AudioContext = AudioContext as any;

  test('click settings button should show settings menu', () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('click close settings button should close settings menu', () => {
    const mockSetShowSettings = jest.fn();
    render(<SettingsMenu showSettings setShowSettings={mockSetShowSettings} />);
    const closeSettingsButton = screen.getAllByRole('button', {
      name: /Close/i,
    })[0];
    fireEvent.click(closeSettingsButton);
    expect(mockSetShowSettings).toBeCalledWith(false);
  });

  test('change errorMessagesTimeout', () => {
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

    const errorMessagesTimeoutOptions = screen.getAllByRole('button')[0];
    fireEvent.mouseDown(errorMessagesTimeoutOptions);

    fireEvent.click(within(screen.getByRole('listbox')).getByText(/15s/));

    expect(mockSetSettings).toBeCalledWith({
      ...mockedElectron.store.config.getSettings(),
      errorMessagesTimeout: 15,
    });
  });
});
