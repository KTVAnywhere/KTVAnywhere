import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SongUpload from '../components/SongUpload';

describe('SongUpload', () => {
  test('should render', () => {
    const mockFn = jest.fn();
    expect(render(<SongUpload setSongList={mockFn} />)).toBeTruthy();
  });

  test('song picker should set input value to name of file', async () => {
    global.window.electron = {
      ...window.electron,
      dialog: {
        openFile: () => Promise.resolve('C:\\dir\\file.mp3'),
      },
    };
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
    const songPickerButton = screen.getByTestId('song-picker-button');
    const songPickerInput = screen.getByTestId('song-picker-input');
    fireEvent.click(songPickerButton);

    await waitFor(() => expect(songPickerInput).toHaveValue('file.mp3'));
  });
});
