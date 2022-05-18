import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { SongProps } from '../components/SongItem';
import { SongsQueueManager } from '../components/SongsQueue';

describe('SongQueue', () => {
  const songs = [{} as SongProps];
  const queue = [{} as SongProps];
  const mockFn = jest.fn();

  test('should render', () => {
    expect(
      render(
        <SongsQueueManager songs={songs} queue={queue} setQueue={mockFn} />
      )
    ).toBeTruthy();
  });
});
