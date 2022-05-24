import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';
import mockedElectron from '../__testsData__/mocks';

global.window.electron = mockedElectron;
HTMLMediaElement.prototype.pause = jest.fn();

describe('App', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
