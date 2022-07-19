import '@testing-library/jest-dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { AudioContext } from 'standardized-audio-context-mock';
import mockedElectron, {
  mockedAudioStatus,
  mockedAlertMessage,
} from '../__testsData__/mocks';
import { songTestData, testGraph } from '../__testsData__/testData';
import * as AudioStatusContext from '../components/AudioStatus.context';
import { AudioStatusProvider } from '../components/AudioStatus.context';
import { AlertMessageProvider } from '../components/AlertMessage';
import * as AlertContext from '../components/AlertMessage';
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

describe('Pitch graph exceptions', () => {
  global.window.AudioContext = AudioContext as any;
  global.window.electron = mockedElectron;

  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test('read graph data error', async () => {
    const exampleErrorMessage = 'graph file not found';
    const mockRead = jest.fn().mockRejectedValue(exampleErrorMessage);
    global.window.electron = {
      ...mockedElectron,
      file: {
        ...mockedElectron.file,
        read: mockRead,
        ifFileExists: jest.fn().mockReturnValue(true),
      },
    };
    const mockSetAlertMessage = jest.fn();
    jest.spyOn(AlertContext, 'useAlertMessage').mockReturnValue({
      ...mockedAlertMessage,
      setAlertMessage: mockSetAlertMessage,
    });
    jest.spyOn(AudioStatusContext, 'useAudioStatus').mockReturnValue({
      ...mockedAudioStatus,
      currentSong: songTestData[1],
    });
    render(
      <AlertMessageProvider>
        <AudioStatusProvider>
          <PitchGraph />
        </AudioStatusProvider>
      </AlertMessageProvider>
    );
    await waitFor(() =>
      expect(mockSetAlertMessage).toBeCalledWith({
        message: `Error reading graph data: ${exampleErrorMessage}`,
        severity: 'error',
      })
    );
  });
});
