import { Dispatch, SetStateAction, useState } from 'react';
import {
  IconButton,
  Paper,
  Popper,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { useAlertMessage } from '../AlertMessage';
import { useAudioStatus } from './AudioStatus.context';

const MicrophoneMenu = ({
  open,
  anchorEl,
  microphoneGainNode,
  microphoneVolume,
  setMicrophoneVolume,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  microphoneGainNode: GainNode;
  microphoneVolume: number;
  setMicrophoneVolume: Dispatch<SetStateAction<number>>;
}) => {
  const volumeChange = (_event: Event, newValue: number | number[]) => {
    setMicrophoneVolume(newValue as number);
    microphoneGainNode.gain.value = (newValue as number) / 100;
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="top">
      <Paper
        sx={{
          padding: '20px',
        }}
      >
        <Stack direction="column" alignItems="center" justifyContent="center">
          <Stack direction="row" sx={{ padding: '5px', width: '280px' }}>
            <Typography sx={{ width: '230px' }}>
              Volume: {microphoneVolume}%
            </Typography>
            <Slider
              aria-label="Volume"
              value={microphoneVolume}
              onChange={volumeChange}
              min={0}
              max={100}
              color="secondary"
            />
          </Stack>
        </Stack>
      </Paper>
    </Popper>
  );
};

const Microphone = () => {
  const {
    audioContext,
    microphone1Enabled,
    setMicrophone1Enabled,
    microphone2Enabled,
    setMicrophone2Enabled,
    microphone1Media,
    setMicrophone1Media,
    microphone2Media,
    setMicrophone2Media,
    audioInput1Id,
    audioInput2Id,
    microphone1GainNode,
    microphone2GainNode,
    microphone1Volume,
    setMicrophone1Volume,
    microphone2Volume,
    setMicrophone2Volume,
  } = useAudioStatus();
  const [anchorEl1, setAnchorEl1] = useState<HTMLElement | null>(null);
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const [openMicrophone1Menu, setOpenMicrophone1Menu] =
    useState<boolean>(false);
  const [openMicrophone2Menu, setOpenMicrophone2Menu] =
    useState<boolean>(false);
  const { setAlertMessage, setShowAlertMessage } = useAlertMessage();

  const getMicrophoneMedia = async (audioInputId: string) => {
    let stream = null;
    let microphoneSource = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: audioInputId },
        video: false,
      });
      microphoneSource = await audioContext.createMediaStreamSource(stream);
    } catch (err) {
      setAlertMessage({
        message: 'Cannot connect to selected microphone',
        severity: 'error',
      });
      setShowAlertMessage(true);
    }
    return microphoneSource;
  };

  const enableMicrophone = async (micNo: number) => {
    if (micNo === 1) {
      setMicrophone1Enabled(true);
      const micSource = await getMicrophoneMedia(audioInput1Id);
      if (micSource) {
        setMicrophone1Media(micSource);
        micSource.connect(microphone1GainNode);
        microphone1GainNode.connect(audioContext.destination);
      }
    } else if (micNo === 2) {
      setMicrophone2Enabled(true);
      const micSource = await getMicrophoneMedia(audioInput2Id);
      if (micSource) {
        setMicrophone2Media(micSource);
        micSource.connect(microphone2GainNode);
        microphone2GainNode.connect(audioContext.destination);
      }
    }
  };

  const disableMicrophone = (micNo: number) => {
    if (micNo === 1) {
      setMicrophone1Enabled(false);
      if (microphone1Media) {
        microphone1Media.disconnect();
        microphone1GainNode.disconnect();
        setMicrophone1Media(null);
      }
    } else if (micNo === 2) {
      setMicrophone2Enabled(false);
      if (microphone2Media) {
        microphone2Media.disconnect();
        microphone2GainNode.disconnect();
        setMicrophone2Media(null);
      }
    }
  };

  const clickOpenMenu1 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl1(event.currentTarget);
    setOpenMicrophone1Menu((state) => !state);
    setOpenMicrophone2Menu(false);
  };

  const clickOpenMenu2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
    setOpenMicrophone1Menu(false);
    setOpenMicrophone2Menu((state) => !state);
  };

  return (
    <Stack direction="row">
      <Stack direction="column" alignItems="center" justifyContent="center">
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Tooltip
            title={
              openMicrophone1Menu ? 'close mic settings' : 'open mic settings'
            }
            placement="bottom"
          >
            <IconButton onClick={clickOpenMenu1} sx={{ padding: 0 }}>
              <MicIcon sx={{ fontSize: '30px' }} />
            </IconButton>
          </Tooltip>
          <MicrophoneMenu
            open={openMicrophone1Menu}
            anchorEl={anchorEl1}
            microphoneGainNode={microphone1GainNode}
            microphoneVolume={microphone1Volume}
            setMicrophoneVolume={setMicrophone1Volume}
          />
          <Switch
            checked={microphone1Enabled}
            onClick={() =>
              microphone1Enabled ? disableMicrophone(1) : enableMicrophone(1)
            }
            color="secondary"
            data-testid="toggle-microphone-1-switch"
          />
        </Stack>
        <Typography align="center">mic 1</Typography>
      </Stack>
      <Stack direction="column" alignItems="center" justifyContent="center">
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Tooltip
            title={
              openMicrophone2Menu ? 'close mic settings' : 'open mic settings'
            }
            placement="bottom"
          >
            <IconButton onClick={clickOpenMenu2} sx={{ padding: 0 }}>
              <MicIcon sx={{ fontSize: '30px' }} />
            </IconButton>
          </Tooltip>
          <MicrophoneMenu
            open={openMicrophone2Menu}
            anchorEl={anchorEl2}
            microphoneGainNode={microphone2GainNode}
            microphoneVolume={microphone2Volume}
            setMicrophoneVolume={setMicrophone2Volume}
          />
          <Switch
            checked={microphone2Enabled}
            onClick={() =>
              microphone2Enabled ? disableMicrophone(2) : enableMicrophone(2)
            }
            color="secondary"
            data-testid="toggle-microphone-2-switch"
          />
        </Stack>
        <Typography align="center">mic 2</Typography>
      </Stack>
    </Stack>
  );
};

export default Microphone;
