import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import App from '../renderer/App';
import mockedElectron from '../__testsData__/mocks';

describe('Main page', () => {
  global.AudioContext = AudioContext as any;
  global.window.electron = mockedElectron;
  it('should render without errors', async () => {
    await waitFor(() => expect(render(<App />)).toBeTruthy());
  });
});
