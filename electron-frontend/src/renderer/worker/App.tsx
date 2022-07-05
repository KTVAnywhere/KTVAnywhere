import {
  BasicPitch,
  NoteEventTime,
  noteFramesToTime,
  outputToNotesPoly,
} from '@spotify/basic-pitch';
import { useEffect } from 'react';

const App = () => {
  const audioContext = new AudioContext({ sampleRate: 22050 });
  const modelPath =
    'https://raw.githubusercontent.com/spotify/basic-pitch-ts/main/model/model.json';
  const basicPitch = new BasicPitch(modelPath);

  const audioBufferToPitches = async (audioBuffer: Float32Array) => {
    const ONSET_THRESHOLD = 0.95;
    const FRAME_THRESHOLD = 0.2;
    const MIN_NOTELENGTH = 20;
    const INFER_OFFSETS = false;
    const MAX_FREQUENCY = 800;
    const MIN_FREQUENCY = 80;

    const frames: number[][] = [];
    const onsets: number[][] = [];
    try {
      await basicPitch.evaluateModel(
        audioBuffer,
        (f: number[][], o: number[][]) => {
          frames.push(...f);
          onsets.push(...o);
        },
        () => {}
      );
      const noteEvents = noteFramesToTime(
        outputToNotesPoly(
          frames,
          onsets,
          ONSET_THRESHOLD,
          FRAME_THRESHOLD,
          MIN_NOTELENGTH,
          INFER_OFFSETS,
          MAX_FREQUENCY,
          MIN_FREQUENCY
        )
      );
      return { noteEvents };
    } catch (error) {
      return {
        noteEvents: [] as NoteEventTime[],
        error: error as Error,
      };
    }
  };

  const processPitch = async (audioPath: string) => {
    const toArrayBuffer = (buffer: Buffer) => {
      const ab = new ArrayBuffer(buffer.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < buffer.length; i += 1) {
        view[i] = buffer[i];
      }
      return ab;
    };
    if (window.electron.file.ifFileExists(audioPath)) {
      try {
        const { noteEvents, error } = await window.electron.file
          .readAsBuffer(audioPath)
          .then((buffer) => audioContext.decodeAudioData(toArrayBuffer(buffer)))
          .then((audioBuffer) =>
            audioBufferToPitches(audioBuffer.getChannelData(0))
          );
        return { noteEvents, error };
      } catch (decodeError) {
        return {
          noteEvents: [] as NoteEventTime[],
          error: decodeError as Error,
        };
      }
    }
    return {
      noteEvents: [] as NoteEventTime[],
      error: new Error('Vocals file not found'),
    };
  };

  useEffect(() => {
    const basicPitchProcessSongUnsubscribe =
      window.electron.preprocess.basicPitchProcessSong(
        (song, vocalsPath, accompanimentPath) =>
          processPitch(vocalsPath).then((result) =>
            window.electron.preprocess.basicPitchProcessResult(
              song,
              vocalsPath,
              accompanimentPath,
              result
            )
          )
      );
    return () => {
      basicPitchProcessSongUnsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div>display</div>;
};
export default App;
