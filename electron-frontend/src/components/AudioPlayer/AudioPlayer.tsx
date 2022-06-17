import { Grid, IconButton, Slider, Switch, Typography } from '@mui/material';
import { PitchShifter } from 'soundtouchjs';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LyricsIcon from '@mui/icons-material/Lyrics';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { useEffect } from 'react';
import './AudioPlayer.css';
import { DequeueSong, GetQueueLength } from '../SongsQueue';
import { useAlertMessage } from '../Alert.context';
import { useAudioStatus } from './AudioStatus.context';

const ProgressBar = () => {
  const { duration, currentTime, setSkipToTime } = useAudioStatus();

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

export const AudioPlayer = () => {
  const {
    duration,
    setDuration,
    songEnded,
    setSongEnded,
    isPlaying,
    setIsPlaying,
    isPlayingVocals,
    setIsPlayingVocals,
    skipToTime,
    setSkipToTime,
    volume,
    setVolume,
    pitch,
    setPitch,
    currentTime,
    setCurrentTime,
    currentSong,
    setCurrentSong,
    nextSong,
    lyricsEnabled,
    setLyricsEnabled,
    audioContext,
    gainNode,
    source,
    setSource,
  } = useAudioStatus();
  const { setAlertMessage, setShowAlertMessage } = useAlertMessage();

  const reconnectNodes = () => {
    if (source) {
      gainNode.disconnect();
      source.disconnect();
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
    }
  };

  const onPlay = ({
    timePlayed,
    percentagePlayed,
  }: {
    timePlayed: number;
    percentagePlayed: number;
  }) => {
    setCurrentTime(timePlayed);
    if (percentagePlayed === 100) {
      setSongEnded(true);
    }
  };

  const destroySource = () => {
    if (source) {
      source.disconnect();
      setSource(null);
    }
  };

  const toArrayBuffer = (buffer: Buffer) => {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    let i;
    for (i = 0; i < buffer.length; i += 1) {
      view[i] = buffer[i];
    }
    return ab;
  };

  const createSource = (audioBuffer: AudioBuffer, percentagePlayed: number) => {
    setDuration(audioBuffer.duration);
    const newSource = new PitchShifter(audioContext, audioBuffer, 4096);
    newSource.on('play', onPlay);
    newSource.percentagePlayed = percentagePlayed;
    newSource.pitchSemitones = pitch;
    destroySource();
    newSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    setSource(newSource);
  };

  const loadSong = async (
    filePath: string,
    vocalsToggle: boolean,
    callback?: () => void
  ) => {
    let percentagePlayed = 0;
    if (vocalsToggle && duration !== 0) {
      percentagePlayed = currentTime / duration;
    }

    try {
      if (window.electron.file.ifFileExists(filePath)) {
        const arrayBuffer = toArrayBuffer(
          await window.electron.file.readAsBuffer(filePath)
        );
        audioContext.decodeAudioData(arrayBuffer, (buffer: AudioBuffer) => {
          createSource(buffer, percentagePlayed);
        });
        if (callback) {
          callback();
        }
      } else {
        setAlertMessage({
          message: `${filePath} does not exist`,
          severity: 'error',
        });
        setShowAlertMessage(true);
      }
    } catch (error) {
      setAlertMessage({
        message: `${error}`,
        severity: 'error',
      });
      setShowAlertMessage(true);
    }
  };

  const volumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    gainNode.gain.value = (newValue as number) / 100;
  };

  const volumeZero = () => {
    setVolume(0);
    gainNode.gain.value = 0;
  };

  const pitchChange = (_event: Event, newValue: number | number[]) => {
    if (source) {
      source.pitchSemitones = newValue as number;
    }
    setPitch(newValue as number);
  };

  const pitchZero = () => {
    if (source) {
      source.pitchSemitones = 0;
    }
    setPitch(0);
  };

  const playSong = () => {
    if (source) {
      setIsPlaying(true);
      reconnectNodes();
    } else if (!currentSong && GetQueueLength() > 0) {
      const song = DequeueSong();
      if (song) {
        loadSong(song.songPath, false, () => {
          setCurrentSong(song);
          setIsPlaying(true);
        });
      }
    }
  };

  const pauseSong = () => {
    setIsPlaying(false);
    gainNode.disconnect();
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
      if (currentSong.accompanimentPath === '') {
        setAlertMessage({
          message: 'Song must be processed for vocals to be turned off',
          severity: 'info',
        });
        setShowAlertMessage(true);
      } else {
        loadSong(currentSong.accompanimentPath, true, () =>
          setIsPlayingVocals(false)
        );
      }
    }
  };

  const endSong = () => {
    if (GetQueueLength() > 0) {
      const song = DequeueSong();
      if (song) {
        loadSong(song.songPath, false, () => {
          setCurrentSong(song);
          setIsPlaying(true);
          setIsPlayingVocals(true);
        });
      }
    } else {
      destroySource();
      setCurrentSong(null);
      setIsPlaying(false);
      setIsPlayingVocals(true);
      setDuration(0);
      setCurrentTime(0);
    }
    setSongEnded(false);
  };

  const backwardTenSeconds = () => {
    setSkipToTime(() => (currentTime <= 10 ? 0.01 : currentTime - 10));
  };

  const forwardTenSeconds = () => {
    setSkipToTime(() =>
      currentTime + 10 >= duration ? duration : currentTime + 10
    );
  };

  useEffect(() => {
    if (nextSong === null) return;
    loadSong(nextSong.songPath, false, () => {
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setIsPlayingVocals(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSong]);

  useEffect(() => {
    if (skipToTime && source && audioContext) {
      source.percentagePlayed = skipToTime / duration;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipToTime]);

  useEffect(() => {
    if (songEnded) {
      endSong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songEnded]);

  return (
    <Grid container direction="column">
      <Grid item container sx={{ justifyContent: 'center' }}>
        <ProgressBar />
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
          <Grid container direction="row" alignItems="center">
            <RecordVoiceOverIcon sx={{ fontSize: '30px' }} />
            <Switch
              checked={isPlayingVocals}
              onClick={() =>
                isPlayingVocals ? disableVocals() : enableVocals()
              }
              color="secondary"
              data-testid="toggle-vocals-switch"
            />
          </Grid>
          <Typography align="center">vocals</Typography>
        </Grid>
        <Grid item sx={{ marginLeft: '2%' }}>
          <IconButton sx={{ padding: 0 }} onClick={pitchZero}>
            <GraphicEqIcon sx={{ fontSize: '35px' }} />
          </IconButton>
        </Grid>
        <Grid item sx={{ marginLeft: '1%', width: '8%' }}>
          <Slider
            aria-label="Pitch"
            value={pitch}
            onChange={pitchChange}
            marks
            min={-3.5}
            max={3.5}
            step={0.5}
            color="secondary"
          />
          <Typography>Pitch: {pitch > 0 ? `+${pitch}` : pitch}</Typography>
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
          )}
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
          <Grid container direction="row" alignItems="center">
            <LyricsIcon sx={{ fontSize: '30px' }} />
            <Switch
              checked={lyricsEnabled}
              data-testid="toggle-lyrics-button"
              onClick={toggleLyrics}
              color="secondary"
            />
          </Grid>
          <Typography align="center">lyrics</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AudioPlayer;
