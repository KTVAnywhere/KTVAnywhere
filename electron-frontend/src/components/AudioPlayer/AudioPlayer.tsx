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
import { useHotkeys } from 'react-hotkeys-hook';
import { PitchShifter } from 'soundtouchjs';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import LyricsIcon from '@mui/icons-material/Lyrics';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpeedIcon from '@mui/icons-material/Speed';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { useEffect, useState } from 'react';
import { DequeueSong, GetQueueLength } from '../SongsQueue';
import { useAlertMessage } from '../AlertMessage';
import { useAudioStatus } from '../AudioStatus.context';
import { useConfirmation } from '../ConfirmationDialog';
import { SongProps } from '../Song';
import { LyricsAdjust } from '../LyricsPlayer';

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
          pl: '1%',
          pr: '1%',
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
  const MAX_VOLUME = 100;
  const MIN_VOLUME = 0;
  const MAX_PITCH = 3.5;
  const MIN_PITCH = -3.5;
  const PITCH_STEP = 0.5;
  const MAX_TEMPO = 1.2;
  const MIN_TEMPO = 0.8;
  const TEMPO_STEP = 0.1;

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
    tempo,
    setTempo,
    currentTime,
    setCurrentTime,
    currentSong,
    setCurrentSong,
    nextSong,
    setNextSong,
    lyricsEnabled,
    setLyricsEnabled,
    graphEnabled,
    setGraphEnabled,
    audioContext,
    gainNode,
    source,
    setSource,
    audioInput1Id,
    audioInput2Id,
    microphone1Volume,
    microphone2Volume,
    reverb1Volume,
    reverb2Volume,
    microphone1NoiseSuppression,
    microphone2NoiseSuppression,
  } = useAudioStatus();
  const { setAlertMessage } = useAlertMessage();
  const { setConfirmationMessage, setActions, setOpen } = useConfirmation();
  const [previousVolume, setPreviousVolume] = useState(volume);

  const filePathMissingDeleteSong = (song: SongProps, filePath: string) => {
    setConfirmationMessage({
      heading: 'Delete song with missing file',
      message: `"${filePath}" does not exist, do you want to delete "${song.songName}"?`,
    });
    setActions([
      {
        label: 'Confirm',
        fn: () => {
          window.electron.store.songs.deleteSong(song.songId);
          setOpen(false);
        },
      },
    ]);
    setOpen(true);
  };

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
    newSource.tempo = tempo;
    destroySource();
    if (playNow) {
      newSource.connect(gainNode);
      gainNode.connect(audioContext.destination);
    }
    setSource(newSource);
  };

  const loadSong = async (
    song: SongProps,
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
              message: `Error loading song: ${error}`,
              severity: 'error',
            });
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
        filePathMissingDeleteSong(song, filePath);
        setIsLoading(false);
      }
    } catch (error) {
      setAlertMessage({
        message: `Error loading song: ${error}`,
        severity: 'error',
      });
      setIsLoading(false);
    }
  };

  const volumeChange = (_event: Event, value: number | number[]) => {
    let newValue = value as number;
    if (value < MIN_VOLUME) {
      newValue = MIN_VOLUME;
    } else if (value > MAX_VOLUME) {
      newValue = MAX_VOLUME;
    }
    setVolume(newValue);
    gainNode.gain.value = newValue / 100;
  };

  const volumeZero = () => {
    if (volume) {
      setPreviousVolume(volume);
      volumeChange({} as Event, 0);
    } else {
      volumeChange({} as Event, previousVolume);
    }
  };

  const pitchChange = (_event: Event, value: number | number[]) => {
    let newValue = value as number;
    if (value < MIN_PITCH) {
      newValue = MIN_PITCH;
    } else if (value > MAX_PITCH) {
      newValue = MAX_PITCH;
    }
    if (source) {
      source.pitchSemitones = newValue as number;
    }
    setPitch(newValue as number);
  };

  const pitchReset = () => {
    pitchChange({} as Event, 0);
  };

  const tempoChange = (_event: Event, value: number | number[]) => {
    let newValue = value as number;
    if (value < MIN_TEMPO) {
      newValue = MIN_TEMPO;
    } else if (value > MAX_TEMPO) {
      newValue = MAX_TEMPO;
    }
    if (source) {
      source.tempo = newValue as number;
    }
    setTempo(newValue as number);
  };

  const tempoReset = () => {
    tempoChange({} as Event, 1);
  };

  const playSong = () => {
    if (source) {
      setIsPlaying(true);
      reconnectNodes();
    } else if (!currentSong && GetQueueLength() > 0) {
      const song = DequeueSong();
      if (song) {
        loadSong(song, song.songPath, false, true, () => {
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
        message:
          'No lyrics found, go to song details to fetch lyrics or upload lyrics file',
        severity: 'info',
      });
    } else {
      setLyricsEnabled((state) => !state);
    }
  };

  const toggleGraph = () => {
    if (
      !graphEnabled &&
      !(
        currentSong?.graphPath &&
        window.electron.file.ifFileExists(currentSong?.graphPath)
      )
    ) {
      setAlertMessage({
        message: 'Song must be processed for graph to be displayed',
        severity: 'info',
      });
    } else {
      setGraphEnabled((state) => !state);
    }
  };

  const enableVocals = () => {
    if (currentSong) {
      loadSong(currentSong, currentSong.songPath, true, isPlaying, () =>
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
      } else {
        loadSong(
          currentSong,
          currentSong.accompanimentPath,
          true,
          isPlaying,
          () => setIsPlayingVocals(false)
        );
      }
    }
  };

  const endSong = () => {
    if (GetQueueLength() > 0) {
      if (!isLoading) {
        const song = DequeueSong();
        if (song) {
          loadSong(song, song.songPath, false, isPlaying, () => {
            setCurrentSong(song);
            setCurrentTime(0);
            setIsPlayingVocals(true);
          });
        }
      }
    } else {
      gainNode.disconnect();
      destroySource();
      setCurrentSong(null);
      setIsPlaying(false);
      setIsPlayingVocals(true);
      setDuration(0);
      setCurrentTime(0);
    }
    setSongEnded(false);
  };

  const backwardSeconds = (numSeconds: number) => {
    if (source && duration !== 0) {
      const nextTime =
        currentTime <= numSeconds ? 0.01 : currentTime - numSeconds;
      source.percentagePlayed = nextTime / duration;
      setCurrentTime(nextTime);
    }
  };

  const forwardSeconds = (numSeconds: number) => {
    if (source && duration !== 0) {
      const nextTime =
        currentTime + numSeconds >= duration
          ? duration - 1
          : currentTime + numSeconds;
      source.percentagePlayed = nextTime / duration;
      setCurrentTime(nextTime);
    }
  };

  useEffect(() => {
    if (nextSong === null) return;
    loadSong(nextSong, nextSong.songPath, false, true, () => {
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setIsPlayingVocals(true);
      if (!nextSong.lyricsPath) {
        setLyricsEnabled(false);
      }
      if (!nextSong.graphPath) {
        setGraphEnabled(false);
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
      loadSong(currentSong, currentSong.songPath, true, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = () => {
    window.removeEventListener('beforeunload', saveConfig);
    window.electron.store.config.setAudioStatusConfig({
      songId: currentSong ? currentSong.songId : '',
      currentTime,
      duration,
      volume,
      pitch,
      vocalsEnabled: isPlayingVocals,
      lyricsEnabled,
      graphEnabled,
      audioInput1Id,
      audioInput2Id,
      microphone1Volume,
      microphone2Volume,
      reverb1Volume,
      reverb2Volume,
      microphone1NoiseSuppression,
      microphone2NoiseSuppression,
    });
  };

  window.addEventListener('beforeunload', saveConfig);

  useHotkeys(
    'space',
    (e) => {
      e.preventDefault();
      if (isPlaying) pauseSong();
      else playSong();
    },
    { keyup: true },
    [isPlaying, currentSong, source, gainNode, isLoading]
  );

  useHotkeys(
    'up',
    (e) => {
      e.preventDefault();
      volumeChange(e, volume + 5);
    },
    [volume, gainNode]
  );
  useHotkeys(
    'down',
    (e) => {
      e.preventDefault();
      volumeChange(e, volume - 5);
    },
    [volume, gainNode]
  );

  useHotkeys(
    'left',
    (e) => {
      e.preventDefault();
      backwardSeconds(10);
    },
    [source, duration, currentTime]
  );
  useHotkeys(
    'right',
    (e) => {
      e.preventDefault();
      forwardSeconds(10);
    },
    [source, duration, currentTime]
  );

  useHotkeys(
    'shift+down',
    (e) => {
      e.preventDefault();
      pitchChange(e, pitch - PITCH_STEP);
    },
    [pitch, source]
  );
  useHotkeys(
    'shift+up',
    (e) => {
      e.preventDefault();
      pitchChange(e, pitch + PITCH_STEP);
    },
    [pitch, source]
  );

  useHotkeys(
    'shift+left',
    (e) => {
      e.preventDefault();
      tempoChange(e, tempo - TEMPO_STEP);
    },
    [tempo, source]
  );
  useHotkeys(
    'shift+right',
    (e) => {
      e.preventDefault();
      tempoChange(e, tempo + TEMPO_STEP);
    },
    [tempo, source]
  );

  useHotkeys(
    'v',
    () => {
      if (isPlayingVocals) disableVocals();
      else enableVocals();
    },
    { keyup: true },
    [isPlayingVocals, isPlaying, currentSong, source, gainNode, isLoading]
  );

  useHotkeys('m', volumeZero, { keyup: true }, [
    previousVolume,
    volume,
    gainNode,
  ]);

  useHotkeys('g', toggleGraph, { keyup: true }, [graphEnabled, currentSong]);
  useHotkeys('l', toggleLyrics, { keyup: true }, [lyricsEnabled, currentSong]);
  useHotkeys(
    'n',
    (e) => {
      e.preventDefault();
      endSong();
    },
    { keyup: true },
    [isPlaying, currentSong, source, gainNode, isLoading]
  );

  return (
    <Grid container direction="column" data-testid="audio-player">
      <Grid item container sx={{ justifyContent: 'center' }}>
        <ProgressBar />
        <Tooltip title="End song" placement="right">
          <IconButton
            sx={{ p: 0 }}
            data-testid="end-song-button"
            onClick={endSong}
          >
            <SkipNextIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid
        item
        container
        direction="row"
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
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
          <Grid container direction="row" alignItems="center">
            <RecordVoiceOverIcon fontSize="medium" />
            <Switch
              checked={isPlayingVocals}
              onClick={() =>
                isPlayingVocals ? disableVocals() : enableVocals()
              }
              color="secondary"
              size="small"
              data-testid="toggle-vocals-switch"
            />
          </Grid>
          <Typography
            position="absolute"
            variant="subtitle2"
            sx={{ ml: '10px' }}
          >
            vocals
          </Typography>
        </Grid>
        <Grid item sx={{ ml: '1%' }}>
          <IconButton sx={{ p: 0 }} onClick={tempoReset}>
            <SpeedIcon fontSize="medium" />
          </IconButton>
        </Grid>
        <Grid item sx={{ ml: '10px', width: '5%' }}>
          <Slider
            aria-label="Tempo"
            value={tempo}
            onChange={tempoChange}
            marks
            min={MIN_TEMPO}
            max={MAX_TEMPO}
            step={TEMPO_STEP}
            size="small"
            color="secondary"
            data-testid="tempo-slider"
            sx={{ py: 0.6 }}
          />
          <Typography position="absolute" variant="subtitle2">
            tempo: {+tempo.toFixed(1)}
          </Typography>
        </Grid>
        <Grid item sx={{ ml: '1%' }}>
          <IconButton sx={{ p: 0 }} onClick={pitchReset}>
            <GraphicEqIcon fontSize="medium" />
          </IconButton>
        </Grid>
        <Grid item sx={{ ml: '10px', width: '5%' }}>
          <Slider
            aria-label="Pitch"
            value={pitch}
            onChange={pitchChange}
            marks
            min={MIN_PITCH}
            max={MAX_PITCH}
            step={PITCH_STEP}
            size="small"
            color="secondary"
            data-testid="pitch-slider"
            sx={{ py: 0.6 }}
          />
          <Typography position="absolute" variant="subtitle2">
            pitch: {pitch > 0 ? `+${pitch}` : pitch}
          </Typography>
        </Grid>
        <Grid item sx={{ mx: '1%' }}>
          <Tooltip title="Backward 10s" placement="top">
            <IconButton
              sx={{ p: 0 }}
              data-testid="backward-10-button"
              onClick={() => backwardSeconds(10)}
            >
              <FastRewindIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          {isPlaying ? (
            <IconButton
              sx={{ p: 0 }}
              data-testid="pause-button"
              onClick={pauseSong}
            >
              <PauseCircleIcon sx={{ fontSize: '42px' }} />
            </IconButton>
          ) : (
            <IconButton
              sx={{ p: 0 }}
              data-testid="play-button"
              onClick={playSong}
            >
              <PlayCircleIcon sx={{ fontSize: '42px' }} />
            </IconButton>
          )}
          <Tooltip title="Forward 10s" placement="top">
            <IconButton
              sx={{ p: 0 }}
              data-testid="forward-10-button"
              onClick={() => forwardSeconds(10)}
            >
              <FastForwardIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item>
          <IconButton sx={{ p: 0 }} onClick={() => volumeZero()}>
            <VolumeMuteIcon fontSize="medium" />
          </IconButton>
        </Grid>
        <Grid item sx={{ ml: '10px', mr: '2%', width: '6%' }}>
          <Slider
            aria-label="Volume"
            value={volume}
            onChange={volumeChange}
            min={0}
            max={100}
            size="small"
            color="secondary"
            data-testid="volume-slider"
            sx={{ py: 0.6 }}
          />
          <Typography position="absolute" variant="subtitle2">
            volume: {volume}%
          </Typography>
        </Grid>
        <Grid item sx={{ mr: '1%' }}>
          <Grid container direction="row">
            <AutoGraphIcon fontSize="medium" />
            <Switch
              checked={graphEnabled}
              data-testid="toggle-graph-switch"
              onClick={toggleGraph}
              size="small"
              color="secondary"
            />
          </Grid>
          <Typography
            position="absolute"
            variant="subtitle2"
            sx={{ ml: '10px' }}
          >
            graph
          </Typography>
        </Grid>
        <Grid item sx={{ mr: '2%' }}>
          <Grid
            container
            direction="row"
            alignItems="center"
            position="relative"
          >
            <LyricsIcon fontSize="medium" />
            <Switch
              checked={lyricsEnabled}
              data-testid="toggle-lyrics-switch"
              onClick={toggleLyrics}
              size="small"
              color="secondary"
            />
            <Box position="absolute" left="70px" top="-6px">
              {lyricsEnabled &&
                currentSong?.lyricsPath &&
                window.electron.file.ifFileExists(currentSong?.lyricsPath) && (
                  <LyricsAdjust />
                )}
            </Box>
          </Grid>
          <Typography
            position="absolute"
            variant="subtitle2"
            sx={{ ml: '10px' }}
          >
            lyrics
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AudioPlayer;
