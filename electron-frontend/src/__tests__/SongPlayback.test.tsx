import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import mockedElectron from '../__testsData__/mocks';
import {
  testSong,
  testLyrics,
  lineAt5s,
  lineAt10s,
} from '../__testsData__/testData';
import { Lyrics } from '../components/LyricsPlayer';

describe('Lyrics player', () => {
  const mockSend = jest.fn();
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      file: {
        readSend: mockSend,
        readReceive: jest.fn(
          (
            callback: (err: NodeJS.ErrnoException | null, data: string) => void
          ) => {
            callback(null, testLyrics);
          }
        ),
      },
    };
  });
  test('should load the lyrics of song currently playing', () => {
    render(<Lyrics currentSong={testSong} currentTime={0} lyricsEnabled />);
    expect(mockSend).toBeCalledWith(testSong.lyricsPath);
  });

  test('should display lyric line based on time', async () => {
    render(<Lyrics currentSong={testSong} currentTime={6} lyricsEnabled />);
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(lineAt5s));
    await waitFor(() => expect(nextLine).toHaveTextContent(lineAt10s));
  });

  test('lyrics should not be displayed if disabled', async () => {
    render(
      <Lyrics currentSong={testSong} currentTime={6} lyricsEnabled={false} />
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(''));
    await waitFor(() => expect(nextLine).toHaveTextContent(''));
  });
});
