import { Grid, IconButton, Slider, Typography } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LyricsIcon from '@mui/icons-material/Lyrics';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
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
    <Grid container direction="row" alignItems="center" maxWidth="60%">
      <Grid item>
        <Typography>{formatSecondsToMinutesAndSeconds(currentTime)}</Typography>
      </Grid>
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
      <Grid item>
        <Typography>{formatSecondsToMinutesAndSeconds(duration)}</Typography>
      </Grid>
    </Grid>
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
  const [isPlayingVocals, setIsPlayingVocals] = useState(true);
  const [skipToTime, setSkipToTime] = useState<number | null>();
  const [volume, setVolume] = useState<number>(70);

  const loadSong = (
    filePath: string,
    vocalsToggle: boolean,
    callback?: () => void
  ) => {
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    let time = 0;
    if (vocalsToggle) {
      time = audio.currentTime;
    }

    try {
      if (window.electron.file.ifFileExists(filePath)) {
        audio.src = `atom:///${filePath}`;
        audio.load();
        if (vocalsToggle) {
          audio.currentTime = time;
        }
        if (callback) {
          callback();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (nextSong === null) return;
    setCurrentSong(nextSong);
    loadSong(nextSong.songPath, false, () => setIsPlaying(true));
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
        if (song) {
          setCurrentSong(song);
          loadSong(song.songPath, false);
        }
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

  const volumeZero = () => {
    setVolume(0);
    const audio: HTMLAudioElement = document.getElementById(
      'audio'
    ) as HTMLAudioElement;
    audio.volume = 0;
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

  const enableVocals = () => {
    if (currentSong) {
      loadSong(currentSong.songPath, true, () => setIsPlayingVocals(true));
    }
  };

  const disableVocals = () => {
    if (currentSong) {
      loadSong(currentSong.accompanimentPath, true, () =>
        setIsPlayingVocals(false)
      );
    }
  };

  const endSong = () => {
    if (GetQueueLength() > 0) {
      const song = DequeueSong();
      setCurrentSong(song);
      if (song) {
        loadSong(song.songPath, false);
      }
    } else {
      const audio: HTMLAudioElement = document.getElementById(
        'audio'
      ) as HTMLAudioElement;
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
    <Grid container direction="column">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio id="audio" data-testid="audio-element" onEnded={endSong} />
      <Grid item container sx={{ justifyContent: 'center' }}>
        <ProgressBar
          duration={duration}
          currentTime={currentTime}
          setSkipToTime={setSkipToTime}
        />
        <IconButton
          sx={{ padding: 0 }}
          data-testid="end-song-button"
          onClick={endSong}
        >
          <SkipNextIcon sx={{ fontSize: '35px' }} />
        </IconButton>
      </Grid>
      <Grid item container direction="row" sx={{ justifyContent: 'center' }}>
        <Grid
          item
          sx={{ position: 'absolute', left: '2%', right: '85%', top: 0 }}
        >
          <Typography noWrap sx={{ fontSize: '32px' }}>
            {currentSong?.songName}
          </Typography>
          <Typography noWrap sx={{ fontSize: '24px', opacity: '80%' }}>
            {currentSong?.artist}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            sx={{ padding: 0 }}
            onClick={() => (isPlayingVocals ? disableVocals() : enableVocals())}
          >
            <RecordVoiceOverIcon sx={{ fontSize: '30px' }} />
          </IconButton>
          <Typography>vocals</Typography>
        </Grid>
        <Grid item sx={{ marginLeft: '2%' }}>
          <IconButton sx={{ padding: 0 }}>
            <GraphicEqIcon sx={{ fontSize: '35px' }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ marginLeft: '1%', width: '8%' }}>
          <Slider
            className="volume-slider"
            aria-label="Volume"
            value={volume}
            onChange={volumeChange}
            min={0}
            max={100}
            color="secondary"
          />
          <Typography>Pitch: {volume}%</Typography>
        </Grid>
        <Grid item sx={{ marginLeft: '3%', marginRight: '3%' }}>
          <IconButton
            sx={{ padding: 0 }}
            data-testid="backward-10-button"
            onClick={backwardTenSeconds}
          >
            <FastRewindIcon sx={{ fontSize: '35px' }} />
          </IconButton>
          {isPlaying ? (
            <IconButton
              sx={{ padding: 0 }}
              data-testid="pause-button"
              onClick={pauseSong}
            >
              <PauseCircleIcon sx={{ fontSize: '64px' }} />
            </IconButton>
          ) : (
            <IconButton
              sx={{ padding: 0 }}
              data-testid="play-button"
              onClick={playSong}
            >
              <PlayCircleIcon sx={{ fontSize: '64px' }} />
            </IconButton>
          )}{' '}
          <IconButton
            sx={{ padding: 0 }}
            data-testid="forward-10-button"
            onClick={forwardTenSeconds}
          >
            <FastForwardIcon sx={{ fontSize: '35px' }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ marginRight: '1%' }}>
          <IconButton sx={{ padding: 0 }} onClick={() => volumeZero()}>
            <VolumeMuteIcon sx={{ fontSize: '35px' }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ marginRight: '2%', width: '8%' }}>
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
          <Typography>Volume: {volume}%</Typography>
        </Grid>
        <Grid item>
          <IconButton
            sx={{ padding: 0 }}
            data-testid="toggle-lyrics-button"
            onClick={toggleLyrics}
          >
            <LyricsIcon sx={{ fontSize: '30px' }} />
          </IconButton>
          <Typography>lyrics</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AudioPlayer;
