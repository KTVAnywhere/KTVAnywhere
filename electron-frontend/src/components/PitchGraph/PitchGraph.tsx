import { Box, Container, Divider } from '@mui/material';
import { NoteEventTime } from '@spotify/basic-pitch/';
import { useEffect, useState } from 'react';
import { useAudioStatus } from '../AudioPlayer';

const readGraphData = async (filePath: string) => {
  if (window.electron.file.ifFileExists(filePath)) {
    const processedPitches = [] as NoteEventTime[];
    return window.electron.file
      .read(filePath)
      .then((values) => JSON.parse(values) as NoteEventTime[])
      .then((noteEvents) =>
        noteEvents.sort(
          (note1, note2) => note1.startTimeSeconds - note2.startTimeSeconds
        )
      )
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
                note.durationSeconds,
                endNote.startTimeSeconds +
                  endNote.durationSeconds -
                  note.startTimeSeconds
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
  const [pitchArray, setPitchArray] = useState<NoteEventTime[]>([]);
  const { currentSong, currentTime, graphEnabled } = useAudioStatus();
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

  return (
    <Container sx={{ position: 'relative' }}>
      <Divider
        orientation="vertical"
        sx={{ position: 'absolute', left: `${STEP * BEFORE}px` }}
      />
      <Container
        sx={{
          position: 'relative',
          height: '800px',
          left: `${STEP * BEFORE}px`,
          transform: `translateX(-${currentTime * STEP}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {pitchArray.map(
          ({ startTimeSeconds, durationSeconds, pitchMidi }) =>
            currentTime + 5 >= startTimeSeconds &&
            currentTime - 5 <= startTimeSeconds + durationSeconds && (
              <Box
                key={`${startTimeSeconds}-${pitchMidi}`}
                sx={{
                  position: 'absolute',
                  left: `${startTimeSeconds * STEP}px`,
                  bottom: `${(pitchMidi - 39) * 10}px`,
                  bgcolor: 'white',
                  height: '10px',
                  width: `${durationSeconds * STEP + 1}px`,
                  borderRadius: 10,
                }}
              />
            )
        )}
      </Container>
    </Container>
  );
};

export default PitchGraph;
