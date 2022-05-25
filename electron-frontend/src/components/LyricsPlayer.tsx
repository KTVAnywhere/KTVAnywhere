import { useEffect, useState } from 'react';
import { Lrc, Runner } from 'lrc-kit';
import { SongProps } from './SongItem';
import './LyricsPlayer.css';

interface LyricsProps {
  currentSong: SongProps | null;
  currentTime: number;
  lyricsEnabled: boolean;
}

export const Lyrics = ({
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
      window.electron.file.readReceive((err, data) => {
        if (err) {
          console.log(err);
        } else {
          setRunner(new Runner(Lrc.parse(data)));
        }
      });
      window.electron.file.readSend(currentSong.lyricsPath);
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
    <div className="lyricsGroup">
      <div className="lyrics" data-testid="lyrics">
        {lyrics}
      </div>
      <div className="nextLyrics" data-testid="next-lyrics">
        {nextLyrics}
      </div>
    </div>
  );
};

export const test = 'hello';
