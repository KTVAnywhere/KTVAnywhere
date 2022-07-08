import { Box, Container } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useAudioStatus } from '../AudioStatus.context';

export interface NoteEventTime {
  startTimeSeconds: number;
  durationSeconds: number;
  pitchMidi: number;
  amplitude: number;
}

const readGraphData = async (filePath: string) => {
  if (window.electron.file.ifFileExists(filePath)) {
    const processedPitches = [] as NoteEventTime[];
    return window.electron.file
      .read(filePath)
      .then((values) => JSON.parse(values) as NoteEventTime[])
      .then((noteEvents) =>
        noteEvents.forEach((note) => {
          if (processedPitches.length === 0) {
            processedPitches.push(note);
          } else {
            const lastIndex = processedPitches.length - 1;
            const endNote = processedPitches[lastIndex];
            if (
              note.startTimeSeconds <=
              endNote.startTimeSeconds + endNote.durationSeconds
            ) {
              processedPitches[lastIndex].pitchMidi =
                note.durationSeconds > endNote.durationSeconds
                  ? note.pitchMidi
                  : endNote.pitchMidi;
              processedPitches[lastIndex].durationSeconds = Math.max(
                endNote.durationSeconds,
                note.startTimeSeconds +
                  note.durationSeconds -
                  endNote.startTimeSeconds
              );
            } else {
              processedPitches.push(note);
            }
          }
        })
      )
      .then(() => processedPitches);
  }
  return [];
};

const PitchGraph = () => {
  const BEFORE = 1;
  const STEP = 200;
  const NUM_TRACKS = 30;
  const TRACK_HEIGHT = 20;
  const BAR_HEIGHT = '50%';
  const [pitchArray, setPitchArray] = useState<NoteEventTime[]>([]);
  const { currentSong, currentTime, graphEnabled, pitch } = useAudioStatus();
  useEffect(() => {
    if (!graphEnabled || currentSong === null) {
      setPitchArray([]);
    } else if (!currentSong.graphPath) {
      setPitchArray([]);
    } else if (window.electron.file.ifFileExists(currentSong.graphPath)) {
      readGraphData(currentSong.graphPath)
        .then((data) => setPitchArray(data))
        .catch(console.error);
    }
  }, [currentSong, graphEnabled]);

  const time = useRef(currentTime);
  useEffect(() => {
    time.current = currentTime;
  }, [currentTime]);

  const roundToNearest = (valueToRound: number, precision: number) =>
    Math.round(valueToRound / precision) * precision;

  return (
    <>
      {graphEnabled && (
        <Container
          data-testid="pitch-graph"
          sx={{
            position: 'relative',
          }}
        >
          <Box
            bgcolor="text.primary"
            sx={{
              position: 'absolute',
              opacity: '50%',
              width: '2px',
              height: `${(NUM_TRACKS - 1) * TRACK_HEIGHT}px`,
              bottom: 0,
              left: `${STEP * BEFORE}px`,
            }}
          />
          {Array.from(Array(NUM_TRACKS).keys()).map((index) => (
            <Box
              bgcolor="text.primary"
              key={`track-${index}`}
              sx={{
                position: 'absolute',
                bottom: `${index * TRACK_HEIGHT}px`,
                left: '-5%',
                opacity: '20%',
                height: '1px',
                width: '110%',
              }}
            />
          ))}
          <Container
            sx={{
              position: 'relative',
              left: `${STEP * BEFORE}px`,
              transform: `translateX(-${(currentTime + 0.25) * STEP}px)`,
              transition:
                Math.abs(time.current - currentTime) < 2
                  ? 'transform 0.5s linear'
                  : 'transform 33ms linear',
              willChange: 'transform, transition',
            }}
          >
            {pitchArray.map(
              ({ startTimeSeconds, durationSeconds, pitchMidi }) =>
                currentTime + 5 >= startTimeSeconds &&
                currentTime - 2 <= startTimeSeconds + durationSeconds && (
                  <Box
                    data-testid={`${startTimeSeconds}-${pitchMidi}-${durationSeconds}`}
                    key={`${startTimeSeconds}-${pitchMidi}-outer`}
                    sx={{
                      position: 'absolute',
                      display: 'flex',
                      direction: 'column',
                      alignItems: 'center',
                      left: `${startTimeSeconds * STEP}px`,
                      bottom: `${
                        (roundToNearest(pitchMidi / 2, 0.5) + pitch - 17) *
                        TRACK_HEIGHT
                      }px`,
                      height: `${TRACK_HEIGHT}px`,
                    }}
                  >
                    <Box
                      key={`${startTimeSeconds}-${pitchMidi}-inner`}
                      sx={{
                        bgcolor: 'primary.main',
                        height: `${BAR_HEIGHT}`,
                        width: `${durationSeconds * STEP}px`,
                        borderRadius: 10,
                      }}
                    />
                  </Box>
                )
            )}
          </Container>
        </Container>
      )}
    </>
  );
};

export default PitchGraph;
