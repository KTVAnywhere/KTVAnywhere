import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import TitleBar from '../components/TitleBar';
import mockedElectron from '../__testsData__/mocks';

describe('Title bar component test', () => {
  const mockCloseApp = jest.fn();
  const mockMinimizeApp = jest.fn();
  const mockMaximizeApp = jest.fn();
  global.window.electron = {
    ...mockedElectron,
    window: {
      reloadApp: jest.fn(),
      closeApp: mockCloseApp,
      minimizeApp: mockMinimizeApp,
      maximizeApp: mockMaximizeApp,
    },
  };

  test('should render without errors', async () => {
    render(<TitleBar />);
    expect(screen.getByText('KTVAnywhere')).toBeInTheDocument();
  });
  test('click close button should close application', async () => {
    render(<TitleBar />);
    const closeAppButton = screen.getByTestId('close-app-button');
    fireEvent.click(closeAppButton);
    expect(mockCloseApp).toBeCalled();
  });
  test('click minimize button should minimize application', async () => {
    render(<TitleBar />);
    const minimizeAppButton = screen.getByTestId('minimize-app-button');
    fireEvent.click(minimizeAppButton);
    expect(mockMinimizeApp).toBeCalled();
  });
  test('click maximize button should maximize application', async () => {
    render(<TitleBar />);
    const maximizeAppButton = screen.getByTestId('maximize-app-button');
    fireEvent.click(maximizeAppButton);
    expect(mockMaximizeApp).toBeCalled();
  });
});
