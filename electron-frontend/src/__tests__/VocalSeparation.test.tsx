import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import mockedElectron from '../__testsData__/mocks';
import { SongsStatusProvider } from '../components/Song';
import * as SongsStatusContext from '../components/Song/SongsStatus.context';
import SongList from '../components/SongList';
import { songListTestData } from '../__testsData__/testData';

describe('Process song with spleeter', () => {
  const mockSetOpenSong = jest.fn();
  const mockSetNextSong = jest.fn();
  const mockSongsStatus: string[] = [];
  const mockSetSongsStatus = jest.fn();

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('click process button will enqueue the song into the queue containing songs to be processed with spleeter', () => {
    jest.spyOn(SongsStatusContext, 'useSongsStatus').mockReturnValue({
      songsStatus: mockSongsStatus,
      setSongsStatus: mockSetSongsStatus,
    });
    render(
      <SongsStatusProvider>
        <SongList setOpenSong={mockSetOpenSong} setNextSong={mockSetNextSong} />
      </SongsStatusProvider>
    );

    const { getAllByRole } = within(
      screen.getByRole('list', { name: /data/i })
    );
    const firstProcessButton = getAllByRole('button', {
      name: /Process/i,
    })[0];

    expect(mockSetSongsStatus).not.toBeCalled();
    fireEvent.click(firstProcessButton);
    expect(mockSetSongsStatus).toBeCalledWith([
      ...mockSongsStatus,
      songListTestData[0].songId,
    ]);
  });
});
