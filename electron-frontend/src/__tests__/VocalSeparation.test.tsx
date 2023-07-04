import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import mockedElectron from '../__testsData__/mocks';
import { SongDialogProvider, SongsStatusProvider } from '../components/Song';
import * as SongsStatusContext from '../components/Song/SongsStatus.context';
import {
  ConfirmationDialog,
  ConfirmationProvider,
} from '../components/ConfirmationDialog';
import SongList from '../components/SongList';
import { songListTestData } from '../__testsData__/testData';

describe('Process song with audio separation and basic pitch', () => {
  const mockSetOpenSong = jest.fn();
  const mockSongsStatus: string[] = [];
  const mockSetSongsStatus = jest.fn();

  // mock AutoSizer start
  const originalOffsetHeight: any = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalOffsetWidth: any = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetWidth'
  );
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 50,
    });
  });
  afterAll(() => {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalOffsetHeight
    );
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalOffsetWidth
    );
  });
  // mock AutoSizer end

  beforeEach(() => {
    global.window.electron = {
      ...mockedElectron,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('click process button will enqueue the song into the queue containing songs to be processed', () => {
    jest.spyOn(SongsStatusContext, 'useSongsStatus').mockReturnValue({
      songsStatus: mockSongsStatus,
      setSongsStatus: mockSetSongsStatus,
    });
    render(
      <SongsStatusProvider>
        <SongList setOpenSong={mockSetOpenSong} />
      </SongsStatusProvider>
    );

    const firstProcessButton = screen.getAllByRole('button', {
      name: /Process/i,
    })[0];

    expect(mockSetSongsStatus).not.toBeCalled();
    fireEvent.click(firstProcessButton);
    expect(mockSetSongsStatus).toBeCalledWith([
      ...mockSongsStatus,
      songListTestData[0].songId,
    ]);
  });

  test('click process button when song has been processed will show a confirmation dialog', () => {
    jest.spyOn(SongsStatusContext, 'useSongsStatus').mockReturnValue({
      songsStatus: mockSongsStatus,
      setSongsStatus: mockSetSongsStatus,
    });
    render(
      <ConfirmationProvider>
        <SongDialogProvider>
          <SongsStatusProvider>
            <SongList setOpenSong={mockSetOpenSong} />
            <ConfirmationDialog />
          </SongsStatusProvider>
        </SongDialogProvider>
      </ConfirmationProvider>
    );

    const secondProcessButton = screen.getAllByRole('button', {
      name: /Process/i,
    })[1];

    expect(mockSetSongsStatus).not.toBeCalled();
    fireEvent.click(secondProcessButton);
    expect(mockSetSongsStatus).not.toBeCalled();
  });
});
