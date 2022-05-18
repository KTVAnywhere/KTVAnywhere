import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SongUpload from '../components/SongUpload';

describe('SongUpload', () => {
  beforeEach(() => {
    global.window.electron = {
      ...window.electron,
      dialog: {
        openFile: () => Promise.resolve('C:\\dir\\file.mp3'),
      },
    };
  });

  test('should render', () => {
    const mockFn = jest.fn();
    expect(render(<SongUpload setSongList={mockFn} />)).toBeTruthy();
  });

  test('song picker should set input value to name of file', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
    const songPickerButton = screen.getByTestId('song-picker-button');
    const songPickerInput = screen.getByTestId('song-picker-input');
    fireEvent.click(songPickerButton);

    await waitFor(() => expect(songPickerInput).toHaveValue('file.mp3'));
  });

  test('song object should be returned on submit', async () => {
    const mockFn = jest.fn();
    render(<SongUpload setSongList={mockFn} />);
    const songNameInput = screen.getByTestId('song-name-input');
    const artistInput = screen.getByTestId('artist-input');
    const songPickerButton = screen.getByTestId('song-picker-button');
    const lyricsPickerButton = screen.getByTestId('lyrics-picker-button');

    fireEvent.change(songNameInput, { target: { value: 'Test song' } });
    fireEvent.change(artistInput, { target: { value: 'Test artist' } });
    fireEvent.click(songPickerButton);
    fireEvent.click(lyricsPickerButton);

    await waitFor(() => expect(mockFn).toHaveBeenCalledTimes(1));
  });
});
