import { Slider } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import './AudioPlayer.css';
import { DequeueSong, GetQueueLength } from './SongsQueue';

const ProgressBar = ({
  duration,
  currentTime,
  setSkipToTime,
}: {
  duration: number | undefined;
  currentTime: number | undefined;
  setSkipToTime: Dispatch<SetStateAction<number | null | undefined>>;
}) => {
  function formatTime(seconds: number) {
    return `${Math.floor(seconds / 60)}:${`0${Math.floor(seconds % 60)}`.slice(
      -2
    )}`;
  }

  function getSkippedTime(
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent
  ) {
    if (duration === undefined) return 0;
    const mousePositionWhenClicked = e.pageX;
    const bar = document.querySelector('.bar-progress') as HTMLSpanElement;
    const leftSideOfBar = bar.getBoundingClientRect().left + window.scrollX;
    const barWidth = bar.offsetWidth;
    const relativePositionInBar = mousePositionWhenClicked - leftSideOfBar;
    const unitTime = duration / barWidth;
    return unitTime * relativePositionInBar;
  }

  function handleTimeChange(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    setSkipToTime(getSkippedTime(e));

    function updateTimeOnMove(event: MouseEvent) {
      setSkipToTime(getSkippedTime(event));
    }

    document.addEventListener('mousemove', updateTimeOnMove);

    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', updateTimeOnMove);
    });
  }

  const currentPercentage =
    currentTime === undefined || duration === undefined
      ? 0
      : (currentTime / duration) * 100;

  return (
    <div className="progress-bar">
      <span className="progress-bar-time">
        {currentTime === undefined ? 0 : formatTime(currentTime)}
      </span>
      <div
        className="bar-progress"
        role="progressbar"
        tabIndex={0}
        aria-label="Progress bar of song"
        style={{
          background: `linear-gradient(to right, #7FB069 ${currentPercentage}%, white 0)`,
        }}
        onMouseDown={(e) => handleTimeChange(e)}
      />
      <span className="progress-bar-time">
        {duration === undefined ? 0 : formatTime(duration)}
      </span>
    </div>
  );
};

export const AudioPlayer = () => {
  const [duration, setDuration] = useState<number>();
  const [currentTime, setCurrentTime] = useState<number>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [skipToTime, setSkipToTime] = useState<number | null>();
  const [currentSongPath, setCurrentSongPath] = useState<string | null>();
  const [songChange, setSongChange] = useState(false);
  const [volume, setVolume] = useState<number>(70);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;

    if (songChange) {
      setSongChange(false);
      if (GetQueueLength() > 0) {
        setCurrentSongPath(DequeueSong()?.songPath);
        audio.src = `atom:///${currentSongPath}`;
        audio.load();
      } else {
        audio.src = '';
        setCurrentSongPath(null);
        setDuration(0);
        setCurrentTime(0);
      }
    }

    const setAudioData = () => {
      audio.play();
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    if (isPlaying) {
      if (audio.readyState) {
        audio.play();
      } else if (!currentSongPath && GetQueueLength() > 0) {
        const str = DequeueSong()?.songPath;
        setCurrentSongPath(str);
        audio.src = `atom:///${str}`;
        audio.load();
      }
    } else {
      audio.pause();
    }

    if (skipToTime && skipToTime !== currentTime) {
      audio.currentTime = skipToTime;
      setSkipToTime(null);
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  });

  const handleEnded = () => {
    setSongChange(true);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    audio.volume = volume / 100;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleEndSong = () => {
    if (currentTime === undefined || duration === undefined) return;
    setSkipToTime(duration);
  };

  const handleBackward = () => {
    if (currentTime === undefined || duration === undefined) return;
    if (currentTime - 10 <= 0) {
      setSkipToTime(0.01);
    } else {
      setSkipToTime(currentTime - 10);
    }
  };

  const handleForward = () => {
    if (currentTime === undefined || duration === undefined) return;
    if (currentTime + 10 >= duration) {
      setSkipToTime(duration);
    } else {
      setSkipToTime(currentTime + 10);
    }
  };

  return (
    <div className="audio-player">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id="audio" onEnded={handleEnded} />
      <button className="player-button" type="button" onClick={handleEndSong}>
        end song
      </button>
      <button className="player-button" type="button" onClick={handleBackward}>
        back 10
      </button>
      <button className="player-button" type="button" onClick={handleForward}>
        forward 10
      </button>
      {isPlaying === true ? (
        <button
          className="player-button"
          type="button"
          onClick={handlePlayPause}
        >
          ||
        </button>
      ) : (
        <button
          className="player-button"
          type="button"
          onClick={handlePlayPause}
        >
          ▶
        </button>
      )}
      <ProgressBar
        duration={duration}
        currentTime={currentTime}
        setSkipToTime={setSkipToTime}
      />
      <Slider
        className="volume-slider"
        aria-label="Volume"
        value={volume}
        onChange={handleVolumeChange}
        min={0}
        max={100}
        color="secondary"
      />
    </div>
  );
};

export default AudioPlayer;
