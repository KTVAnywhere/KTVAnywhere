/* eslint-disable no-underscore-dangle */
import {
  Box,
  Grid,
  IconButton,
  Slider,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
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
import { DequeueSong, GetQueueLength } from '../SongsQueue';
import { useAlertMessage } from '../AlertMessage';
import { useAudioStatus } from './AudioStatus.context';
import { LyricsAdjust } from '../LyricsPlayer';
import Microphone from './Microphone';

const ProgressBar = () => {
  const { duration, currentTime, setCurrentTime, source } = useAudioStatus();

  const formatSecondsToMinutesAndSeconds = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;

  const timeChange = (_event: Event, newValue: number | number[]) => {
    if (source && duration !== 0) {
      source.percentagePlayed = (newValue as number) / duration;
      setCurrentTime(newValue as number);
    }
  };

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="center"
      maxWidth="60%"
    >
      <Grid item>
        <Typography>{formatSecondsToMinutesAndSeconds(currentTime)}</Typography>
      </Grid>
      <Grid
        item
        sx={{
          width: '87%',
          paddingLeft: '1%',
          paddingRight: '1%',
        }}
      >
        <Slider
          aria-label="SongProgress"
          value={currentTime}
          onChange={timeChange}
          min={0}
          max={duration}
          sx={{
            display: 'flex',
            height: '10px',
            '& .MuiSlider-thumb': {
              width: 0,
              height: 0,
              boxShadow: 'none',
              '&:hover, &.Mui-focusVisible, &.Mui-active': {
                boxShadow: 'none',
              },
            },
          }}
        />
      </Grid>
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
    isLoading,
    setIsLoading,
    isPlayingVocals,
    setIsPlayingVocals,
    volume,
    setVolume,
    pitch,
    setPitch,
    currentTime,
    setCurrentTime,
    currentSong,
    setCurrentSong,
    nextSong,
    setNextSong,
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
      source.off();
      source._node.onaudioprocess = null;
      source._node = null;
      source._soundtouch = null;
      source._filter.sourceSound.buffer = null;
      source._filter.sourceSound = null;
      source._filter = null;
      setSource(null);
    }
  };

  const toArrayBuffer = (buffer: Buffer) => {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; i += 1) {
      view[i] = buffer[i];
    }
    return ab;
  };

  const createSource = (
    audioBuffer: AudioBuffer,
    percentagePlayed: number,
    playNow: boolean
  ) => {
    setDuration(audioBuffer.duration);
    const newSource = new PitchShifter(
      audioContext,
      audioBuffer,
      window.electron.store.config.getSettings().audioBufferSize
    );
    newSource.on('play', onPlay);
    newSource.percentagePlayed = percentagePlayed;
    newSource.pitchSemitones = pitch;
    destroySource();
    newSource.connect(gainNode);
    if (playNow) {
      gainNode.disconnect();
      gainNode.connect(audioContext.destination);
    }
    setSource(newSource);
  };

  const loadSong = async (
    filePath: string,
    resumeTime: boolean,
    playNow: boolean,
    callback?: () => void
  ) => {
    if (isLoading) return;
    setIsLoading(true);
    let percentagePlayed = 0;
    if (resumeTime && duration !== 0) {
      percentagePlayed = currentTime / duration;
    }

    try {
      if (window.electron.file.ifFileExists(filePath)) {
        const arrayBuffer = toArrayBuffer(
          await window.electron.file.readAsBuffer(filePath)
        );
        audioContext
          .decodeAudioData(arrayBuffer)
          .then((buffer: AudioBuffer) => {
            createSource(buffer, percentagePlayed, playNow);
            return setIsLoading(false);
          })
          .catch((error) => {
            setAlertMessage({
              message: `${error}`,
              severity: 'error',
            });
            setShowAlertMessage(true);
            setIsLoading(false);
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
        setIsLoading(false);
      }
    } catch (error) {
      setAlertMessage({
        message: `${error}`,
        severity: 'error',
      });
      setShowAlertMessage(true);
      setIsLoading(false);
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
        loadSong(song.songPath, false, true, () => {
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
    if (
      !lyricsEnabled &&
      !(
        currentSong?.lyricsPath &&
        window.electron.file.ifFileExists(currentSong?.lyricsPath)
      )
    ) {
      setAlertMessage({
        message: 'Lyrics file not found',
        severity: 'info',
      });
      setShowAlertMessage(true);
    } else {
      setLyricsEnabled((state) => !state);
    }
  };

  const enableVocals = () => {
    if (currentSong) {
      loadSong(currentSong.songPath, true, isPlaying, () =>
        setIsPlayingVocals(true)
      );
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
        loadSong(currentSong.accompanimentPath, true, isPlaying, () =>
          setIsPlayingVocals(false)
        );
      }
    }
  };

  const endSong = () => {
    if (GetQueueLength() > 0) {
      const song = DequeueSong();
      if (song) {
        loadSong(song.songPath, false, isPlaying, () => {
          setCurrentSong(song);
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
    if (source && duration !== 0) {
      const nextTime = currentTime <= 10 ? 0.01 : currentTime - 10;
      source.percentagePlayed = nextTime / duration;
      setCurrentTime(nextTime);
    }
  };

  const forwardTenSeconds = () => {
    if (source && duration !== 0) {
      const nextTime =
        currentTime + 10 >= duration ? duration : currentTime + 10;
      source.percentagePlayed = nextTime / duration;
      setCurrentTime(nextTime);
    }
  };

  useEffect(() => {
    if (nextSong === null) return;
    loadSong(nextSong.songPath, false, true, () => {
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setIsPlayingVocals(true);
      if (!nextSong.lyricsPath) {
        setLyricsEnabled(false);
      }
    });
    setNextSong(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSong]);

  useEffect(() => {
    if (songEnded) {
      endSong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songEnded]);

  useEffect(() => {
    if (currentSong) {
      loadSong(currentSong.songPath, true, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = () => {
    window.removeEventListener('beforeunload', saveConfig);
    window.electron.store.config.setPlayingSong({
      songId: currentSong ? currentSong.songId : '',
      currentTime,
      duration,
      volume,
      pitch,
      vocalsEnabled: isPlayingVocals,
      lyricsEnabled,
    });
    destroySource();
  };

  window.addEventListener('beforeunload', saveConfig);

  return (
    <Grid container direction="column">
      <Grid item container sx={{ justifyContent: 'center' }}>
        <ProgressBar />
        <Tooltip title="End song" placement="right">
          <IconButton
            sx={{ padding: 0 }}
            data-testid="end-song-button"
            onClick={endSong}
          >
            <SkipNextIcon sx={{ fontSize: '35px' }} />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item container direction="row" sx={{ justifyContent: 'center' }}>
        <Grid
          item
          sx={{ position: 'absolute', left: '2%', right: '85%', top: '15px' }}
        >
          <Tooltip
            title={currentSong ? currentSong.songName : ''}
            placement="top-start"
          >
            <Typography noWrap sx={{ fontSize: '24px' }}>
              {currentSong?.songName}
            </Typography>
          </Tooltip>
          <Tooltip
            title={currentSong ? currentSong.artist : ''}
            placement="top-start"
          >
            <Typography noWrap sx={{ fontSize: '20px', opacity: '80%' }}>
              {currentSong?.artist}
            </Typography>
          </Tooltip>
        </Grid>
        <Grid item>
          <Grid
            container
            direction="row"
            alignItems="center"
            position="relative"
          >
            <Box position="absolute" right="100px" top="0">
              <Microphone />
            </Box>
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
            data-testid="pitch-slider"
          />
          <Typography>Pitch: {pitch > 0 ? `+${pitch}` : pitch}</Typography>
        </Grid>
        <Grid item sx={{ marginLeft: '3%', marginRight: '3%' }}>
          <Tooltip title="Backward 10s" placement="top">
            <IconButton
              sx={{ padding: 0 }}
              data-testid="backward-10-button"
              onClick={backwardTenSeconds}
            >
              <FastRewindIcon sx={{ fontSize: '35px' }} />
            </IconButton>
          </Tooltip>
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
          <Tooltip title="Forward 10s" placement="top">
            <IconButton
              sx={{ padding: 0 }}
              data-testid="forward-10-button"
              onClick={forwardTenSeconds}
            >
              <FastForwardIcon sx={{ fontSize: '35px' }} />
            </IconButton>
          </Tooltip>
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
          <Grid
            container
            direction="row"
            alignItems="center"
            position="relative"
          >
            <LyricsIcon sx={{ fontSize: '30px' }} />
            <Switch
              checked={lyricsEnabled}
              data-testid="toggle-lyrics-button"
              onClick={toggleLyrics}
              color="secondary"
            />
            <Box position="absolute" left="100px" top="0">
              {lyricsEnabled &&
                currentSong?.lyricsPath &&
                window.electron.file.ifFileExists(currentSong?.lyricsPath) && (
                  <LyricsAdjust />
                )}
            </Box>
          </Grid>
          <Typography align="center">lyrics</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AudioPlayer;
