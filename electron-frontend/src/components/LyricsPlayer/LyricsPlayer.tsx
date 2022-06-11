import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Lrc, Runner } from 'lrc-kit';
import { SongProps } from '../Song';

interface LyricsProps {
  currentSong: SongProps | null;
  currentTime: number;
  lyricsEnabled: boolean;
}

const LyricsPlayer = ({
  currentSong,
  currentTime,
  lyricsEnabled,
}: LyricsProps) => {
  const [lyrics, setLyrics] = useState('');
  const [nextLyrics, setNextLyrics] = useState('');
  const [runner, setRunner] = useState(new Runner(Lrc.parse(''), true));

  useEffect(() => {
    if (currentSong === null) {
      setLyrics('file not loaded');
      setRunner(new Runner(Lrc.parse('')));
    } else if (!currentSong.lyricsPath) {
      setLyrics('no lyrics file for song');
      setRunner(new Runner(Lrc.parse('')));
    } else {
      window.electron.file
        .read(currentSong.lyricsPath)
        .then((lyricsData) => setRunner(new Runner(Lrc.parse(lyricsData))))
        .catch((err) => console.log(err));
    }
  }, [currentSong]);

  useEffect(() => {
    if (lyricsEnabled) {
      runner.timeUpdate(currentTime);
      try {
        setLyrics(runner.curLyric().content);
      } catch {
        setLyrics('');
      }
      try {
        const currIndex = runner.curIndex();
        setNextLyrics(runner.getLyric(currIndex + 1).content);
      } catch {
        setNextLyrics('');
      }
    }
  }, [currentTime, lyricsEnabled, runner]);

  useEffect(() => {
    if (!lyricsEnabled) {
      setLyrics('');
      setNextLyrics('');
    }
  }, [lyricsEnabled]);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item>
        <Typography
          sx={{ fontSize: '32px', fontWeight: 600 }}
          data-testid="lyrics"
        >
          {lyrics}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          sx={{ fontSize: '24px', fontWeight: 500, opacity: '40%' }}
          data-testid="next-lyrics"
        >
          {nextLyrics}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default LyricsPlayer;
