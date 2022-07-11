import '@testing-library/jest-dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron, { mockedAudioStatus } from '../__testsData__/mocks';
import { songTestData, testGraph } from '../__testsData__/testData';
import * as AudioStatusContext from '../components/AudioStatus.context';
import { AudioStatusProvider } from '../components/AudioStatus.context';
import PitchGraph from '../components/PitchGraph';

describe('Pitch graph', () => {
  let mockRead = jest.fn().mockResolvedValue(JSON.stringify(testGraph));
  beforeEach(() => {
    global.window.AudioContext = AudioContext as any;
    mockRead = jest.fn().mockResolvedValue(JSON.stringify(testGraph));
    global.window.electron = {
      ...mockedElectron,
      file: {
        ...mockedElectron.file,
        read: mockRead,
        readAsBuffer: jest.fn(),
        ifFileExists: jest.fn().mockReturnValue(true),
      },
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('should load the graph of currently playing', async () => {
    jest
      .spyOn(AudioStatusContext, 'useAudioStatus')
      .mockReturnValue({ ...mockedAudioStatus, currentSong: songTestData[1] });
    render(
      <AudioStatusProvider>
        <PitchGraph />
      </AudioStatusProvider>
    );
    await act(() => expect(mockRead).toBeCalledWith(songTestData[1].graphPath));
  });

  test('should show pitch if start time of pitch is within 5s of song time', async () => {
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentTime: 5,
      currentSong: songTestData[1],
    });
    render(
      <AudioStatusProvider>
        <PitchGraph />
      </AudioStatusProvider>
    );
    const pitchGraph = screen.getByTestId('pitch-graph');
    await waitFor(() => {
      expect(
        within(pitchGraph).queryByTestId(
          `${testGraph[0].startTimeSeconds}-${testGraph[0].pitchMidi}-${testGraph[0].durationSeconds}`
        )
      ).toBeInTheDocument();
      expect(
        within(pitchGraph).queryByTestId(
          `${testGraph[1].startTimeSeconds}-${testGraph[1].pitchMidi}-${testGraph[1].durationSeconds}`
        )
      ).toBeInTheDocument();
      expect(
        within(pitchGraph).queryByTestId(
          `${testGraph[2].startTimeSeconds}-${testGraph[2].pitchMidi}-${testGraph[2].durationSeconds}`
        )
      ).not.toBeInTheDocument();
    });
  });

  test('pitch graph should not be displayed if disabled', async () => {
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentTime: 6,
      currentSong: songTestData[1],
      graphEnabled: false,
    });
    render(
      <AudioStatusProvider>
        <PitchGraph />
      </AudioStatusProvider>
    );
    const graph = screen.queryByTestId('pitch-graph');
    await waitFor(() => expect(graph).not.toBeInTheDocument());
  });
});
