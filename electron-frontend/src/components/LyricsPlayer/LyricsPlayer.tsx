import { useEffect, useState } from 'react';
import { Lrc, Runner } from 'lrc-kit';
import { SongProps } from '../Song';
import styles from './LyricsPlayer.module.css';

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
    } else if (!currentSong.lyricsPath) {
      setLyrics('no lyrics file for song');
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
    <div className={styles.lyricsGroup}>
      <div className={styles.lyrics} data-testid="lyrics">
        {lyrics}
      </div>
      <div className={styles.nextLyrics} data-testid="next-lyrics">
        {nextLyrics}
      </div>
    </div>
  );
};

export default LyricsPlayer;
