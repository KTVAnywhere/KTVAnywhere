import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import { act } from 'react-dom/test-utils';
import App from '../renderer/App';
import mockedElectron from '../__testsData__/mocks';

describe('Main page', () => {
  global.AudioContext = AudioContext as any;
  global.window.electron = mockedElectron;
  const mediaDevicesPromise = Promise.resolve([]);
  const mockEnumerateDevices = jest.fn(() => mediaDevicesPromise);

  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      enumerateDevices: mockEnumerateDevices,
    },
  });

  it('should render without errors', async () => {
    expect(render(<App />)).toBeTruthy();
    await act(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      mediaDevicesPromise;
    });
  });
});
