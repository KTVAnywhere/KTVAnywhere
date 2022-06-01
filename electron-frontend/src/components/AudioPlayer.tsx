import { Button, Slider } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import './AudioPlayer.css';
import { SongProps } from './Song';
import { DequeueSong, GetQueueLength } from './SongsQueue';

const ProgressBar = ({
  duration,
  currentTime,
  setSkipToTime,
}: {
  duration: number;
  currentTime: number;
  setSkipToTime: Dispatch<SetStateAction<number | null | undefined>>;
}) => {
  function formatSecondsToMinutesAndSeconds(seconds: number) {
    return `${Math.floor(seconds / 60)}:${`0${Math.floor(seconds % 60)}`.slice(
      -2
    )}`;
  }

  function getSkippedTime(
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent
  ) {
    const mousePositionWhenClicked = e.pageX;
    const bar = document.querySelector('.bar-progress') as HTMLSpanElement;
    const leftSideOfBar = bar.getBoundingClientRect().left + window.scrollX;
    const barWidth = bar.offsetWidth;
    const relativePositionInBar = mousePositionWhenClicked - leftSideOfBar;
    const unitTime = duration / barWidth;
    return unitTime * relativePositionInBar;
  }

  function songPlayBackTimeChange(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    setSkipToTime(getSkippedTime(e));

    function updateTimeOnMove(event: MouseEvent) {
      setSkipToTime(getSkippedTime(event));
    }

    document.addEventListener('mousemove', updateTimeOnMove);

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', updateTimeOnMove);
    });
  }

  const currentPercentage = duration === 0 ? 0 : (currentTime / duration) * 100;

  return (
    <div className="progress-bar">
      <span className="progress-bar-time">
        {formatSecondsToMinutesAndSeconds(currentTime)}
      </span>
      <div
        className="bar-progress"
        role="progressbar"
        tabIndex={0}
        aria-label="Progress bar of song"
        data-testid="progress-bar"
        style={{
          background: `linear-gradient(to right, #7FB069 ${currentPercentage}%, white 0)`,
        }}
        onMouseDown={(e) => songPlayBackTimeChange(e)}
      />
      <span className="progress-bar-time">
        {formatSecondsToMinutesAndSeconds(duration)}
      </span>
    </div>
  );
};

export const AudioPlayer = ({
  currentTime,
  setCurrentTime,
  currentSong,
  setCurrentSong,
  nextSong,
  setLyricsEnabled,
}: {
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  currentSong: SongProps | null;
  setCurrentSong: Dispatch<SetStateAction<SongProps | null>>;
  nextSong: SongProps | null;
  setLyricsEnabled: Dispatch<SetStateAction<boolean>>;
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [skipToTime, setSkipToTime] = useState<number | null>();
  const [volume, setVolume] = useState<number>(70);

  useEffect(() => {
    if (nextSong === null) return;
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    setCurrentSong(nextSong);
    audio.src = `atom:///${nextSong?.songPath}`;
    audio.load();
    setIsPlaying(true);
  }, [nextSong, setCurrentSong]);

  useEffect(() => {
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    if (isPlaying) {
      if (audio.readyState) {
        audio.play();
      } else if (!currentSong && GetQueueLength() > 0) {
        const song = DequeueSong();
        setCurrentSong(song);
        audio.src = `atom:///${song?.songPath}`;
        audio.load();
        audio.play();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying, currentSong, setCurrentSong]);

  useEffect(() => {
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    if (skipToTime) {
      audio.currentTime = skipToTime;
    }
  }, [skipToTime]);

  useEffect(() => {
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;

    const setAudioData = () => {
      audio.play();
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [setCurrentTime]);

  const volumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    audio.volume = (newValue as number) / 100;
  };

  const playSong = () => {
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const toggleLyrics = () => {
    setLyricsEnabled((state) => !state);
  };

  const endSong = () => {
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    if (GetQueueLength() > 0) {
      const song = DequeueSong();
      setCurrentSong(song);
      audio.src = `atom:///${song?.songPath}`;
      audio.load();
    } else {
      setCurrentSong(null);
      setIsPlaying(false);
      audio.src = '';
      setDuration(0);
      setCurrentTime(0);
    }
  };

  const backwardTenSeconds = () => {
    setSkipToTime(() => (currentTime <= 10 ? 0.01 : currentTime - 10));
  };

  const forwardTenSeconds = () => {
    setSkipToTime(() =>
      currentTime + 10 >= duration ? duration : currentTime + 10
    );
  };

  return (
    <div className="audio-player">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id="audio" data-testid="audio-element" onEnded={endSong} />
      <div className="right-controls">
        <Slider
          className="volume-slider"
          aria-label="Volume"
          value={volume}
          onChange={volumeChange}
          min={0}
          max={100}
          color="secondary"
          data-testid="volume-slider"
        />
        <span>Volume</span>
      </div>
      <div className="bottom-controls">
        <ProgressBar
          duration={duration}
          currentTime={currentTime}
          setSkipToTime={setSkipToTime}
        />
      </div>
      <div className="top-controls">
        <pre>
          <Button
            variant="contained"
            size="small"
            data-testid="backward-10-button"
            onClick={backwardTenSeconds}
          >
            back 10
          </Button>
          <Button
            variant="contained"
            size="small"
            data-testid="forward-10-button"
            onClick={forwardTenSeconds}
          >
            forward 10
          </Button>
          {'  '}
          {isPlaying ? (
            <Button
              variant="contained"
              size="small"
              data-testid="pause-button"
              onClick={pauseSong}
            >
              II
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              data-testid="play-button"
              onClick={playSong}
            >
              ▶
            </Button>
          )}
          {'  '}
          <Button
            sx={{ minWidth: '2px' }}
            variant="contained"
            size="small"
            data-testid="end-song-button"
            onClick={endSong}
          >
            end song
          </Button>
          {'  '}
          <Button
            sx={{ minWidth: '2px' }}
            variant="contained"
            size="small"
            data-testid="toggle-lyrics-button"
            onClick={toggleLyrics}
          >
            toggle lyrics
          </Button>
        </pre>
      </div>
    </div>
  );
};

export default AudioPlayer;
