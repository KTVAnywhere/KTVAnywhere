import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { Lrc, Runner } from 'lrc-kit';
import { useAudioStatus } from '../AudioStatus.context';
import { useAlertMessage } from '../AlertMessage';
import { useLyrics } from './Lyrics.context';

const LyricsPlayer = () => {
  const [lyrics, setLyrics] = useState('');
  const [nextLyrics, setNextLyrics] = useState('');
  const { currentSong, currentTime, lyricsEnabled, setLyricsEnabled } =
    useAudioStatus();
  const { setAlertMessage } = useAlertMessage();
  const { lyricsRunner, setLyricsRunner } = useLyrics();

  useEffect(() => {
    if (!lyricsEnabled || currentSong === null) {
      setLyricsRunner(new Runner(Lrc.parse(''), true));
      setLyricsEnabled(false);
    } else if (
      !currentSong.lyricsPath ||
      !window.electron.file.ifFileExists(currentSong.lyricsPath)
    ) {
      setLyrics('no lyrics file for song');
      setLyricsRunner(new Runner(Lrc.parse(''), true));
      setLyricsEnabled(false);
    } else {
      window.electron.file
        .read(currentSong.lyricsPath)
        .then((lyricsData) =>
          setLyricsRunner(new Runner(Lrc.parse(lyricsData), true))
        )
        .catch((error) =>
          setAlertMessage({
            message: `error loading lyrics file: ${error}`,
            severity: 'error',
          })
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Grid container direction="column" textAlign="center" sx={{ py: '1vh' }}>
      <Grid item>
        <Typography
          sx={{ fontSize: '200%', fontWeight: 600 }}
          data-testid="lyrics"
        >
          {lyrics}
        </Typography>
      </Grid>
      <Grid item>
        <Typography
          sx={{ fontSize: '150%', fontWeight: 500, opacity: '40%' }}
          data-testid="next-lyrics"
        >
          {nextLyrics}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default LyricsPlayer;
