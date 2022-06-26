import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Lrc, Runner } from 'lrc-kit';
import { useAudioStatus } from '../AudioPlayer/AudioStatus.context';
import { useLyrics } from './Lyrics.context';

const LyricsPlayer = () => {
  const [lyrics, setLyrics] = useState('');
  const [nextLyrics, setNextLyrics] = useState('');
  const { currentSong, currentTime, lyricsEnabled, setLyricsEnabled } =
    useAudioStatus();
  const { lyricsRunner, setLyricsRunner } = useLyrics();

  useEffect(() => {
    if (!lyricsEnabled || currentSong == null) {
      setLyricsRunner(new Runner(Lrc.parse(''), true));
    } else if (!currentSong.lyricsPath) {
      setLyrics('no lyrics file for song');
      setLyricsRunner(new Runner(Lrc.parse(''), true));
    } else if (window.electron.file.ifFileExists(currentSong.lyricsPath)) {
      window.electron.file
        .read(currentSong.lyricsPath)
        .then((lyricsData) =>
          setLyricsRunner(new Runner(Lrc.parse(lyricsData), true))
        )
        .catch((err) => console.log(err));
    } else {
      setLyricsEnabled(false);
    }
  }, [currentSong, lyricsEnabled, setLyricsRunner, setLyricsEnabled]);

  useEffect(() => {
    lyricsRunner.timeUpdate(currentTime);
    const lyricsLength = lyricsRunner.getLyrics().length;
    try {
      setLyrics(lyricsRunner.curLyric().content);
      const nextIndex = lyricsRunner.curIndex() + 1;
      if (nextIndex < lyricsLength)
        setNextLyrics(lyricsRunner.getLyric(nextIndex).content);
    } catch {
      setLyrics('');
      setNextLyrics('');
    }
  }, [currentTime, lyricsRunner]);

  return (
    <Grid container direction="column" alignItems="center" textAlign="center">
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
