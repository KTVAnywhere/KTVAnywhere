import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import App from '../renderer/App';
import mockedElectron from '../__testsData__/mocks';

describe('Main page', () => {
  HTMLMediaElement.prototype.pause = jest.fn();
  HTMLMediaElement.prototype.load = jest.fn();
  global.window.electron = mockedElectron;
  it('should render without errors', async () => {
    await waitFor(() => expect(render(<App />)).toBeTruthy());
  });
});
