import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import mockedElectron from '../__testsData__/mocks';
import {
  testSong,
  testLyrics,
  lineAt5s,
  lineAt10s,
} from '../__testsData__/testData';
import LyricsPlayer from '../components/LyricsPlayer';

describe('Lyrics player', () => {
  const mockRead = jest.fn().mockResolvedValue(testLyrics);
  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
      file: {
        read: mockRead,
      },
    };
  });
  test('should load the lyrics of song currently playing', async () => {
    render(
      <LyricsPlayer currentSong={testSong} currentTime={0} lyricsEnabled />
    );
    await waitFor(() => expect(mockRead).toBeCalledWith(testSong.lyricsPath));
  });

  test('should display lyric line based on time', async () => {
    render(
      <LyricsPlayer currentSong={testSong} currentTime={6} lyricsEnabled />
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(lineAt5s));
    await waitFor(() => expect(nextLine).toHaveTextContent(lineAt10s));
  });

  test('lyrics should not be displayed if disabled', async () => {
    render(
      <LyricsPlayer
        currentSong={testSong}
        currentTime={6}
        lyricsEnabled={false}
      />
    );
    const line = screen.getByTestId('lyrics');
    const nextLine = screen.getByTestId('next-lyrics');
    await waitFor(() => expect(line).toHaveTextContent(''));
    await waitFor(() => expect(nextLine).toHaveTextContent(''));
  });
});
