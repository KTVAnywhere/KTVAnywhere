import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import MicIcon from '@mui/icons-material/Mic';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAlertMessage } from '../AlertMessage';
import { useAudioStatus } from '../AudioStatus.context';

const MicrophoneMenuElementsForEachMicrophone = ({
  micNo,
  microphoneEnabled,
  setMicrophoneEnabled,
  audioInputDevices,
  microphoneMedia,
  setMicrophoneMedia,
  audioInputId,
  setAudioInputId,
  microphoneGainNode,
  microphoneVolume,
  setMicrophoneVolume,
  reverbEnabled,
  setReverbEnabled,
  reverbMedia,
  setReverbMedia,
  reverbNode,
  setReverbNode,
  reverbGainNode,
  reverbVolume,
  setReverbVolume,
  getMicrophoneMedia,
  toArrayBuffer,
}: {
  micNo: number;
  microphoneEnabled: boolean;
  setMicrophoneEnabled: Dispatch<SetStateAction<boolean>>;
  audioInputDevices: MediaDeviceInfo[];
  microphoneMedia: MediaStreamAudioSourceNode | null | undefined;
  setMicrophoneMedia: Dispatch<
    SetStateAction<MediaStreamAudioSourceNode | null | undefined>
  >;
  audioInputId: string;
  setAudioInputId: Dispatch<SetStateAction<string>>;
  microphoneGainNode: GainNode;
  microphoneVolume: number;
  setMicrophoneVolume: Dispatch<SetStateAction<number>>;
  reverbEnabled: boolean;
  setReverbEnabled: Dispatch<SetStateAction<boolean>>;
  reverbMedia: MediaStreamAudioSourceNode | null | undefined;
  setReverbMedia: Dispatch<
    SetStateAction<MediaStreamAudioSourceNode | null | undefined>
  >;
  reverbNode: ConvolverNode | undefined;
  setReverbNode: Dispatch<SetStateAction<ConvolverNode | undefined>>;
  reverbGainNode: GainNode;
  reverbVolume: number;
  setReverbVolume: Dispatch<SetStateAction<number>>;
  getMicrophoneMedia: (
    audioInputId: string
  ) => Promise<MediaStreamAudioSourceNode | null>;
  toArrayBuffer: (buffer: Buffer) => ArrayBuffer;
}) => {
  const { audioContext } = useAudioStatus();
  const { setAlertMessage, setShowAlertMessage } = useAlertMessage();
  const [callToEnableMicrophone, setCallToEnableMicrophone] =
    useState<boolean>(false);
  const [callToEnableReverb, setCallToEnableReverb] = useState<boolean>(false);

  const enableMicrophone = async () => {
    const micSource = await getMicrophoneMedia(audioInputId);
    if (micSource) {
      setMicrophoneEnabled(true);
      setMicrophoneMedia(micSource);
      micSource.connect(microphoneGainNode);
      microphoneGainNode.connect(audioContext.destination);
    }
  };

  const enableReverb = async () => {
    if (!microphoneEnabled) {
      enableMicrophone();
    }
    let newReverbMedia;
    let newReverbNode;
    if (!reverbMedia) {
      newReverbMedia = await getMicrophoneMedia(audioInputId);
      if (newReverbMedia) {
        setReverbMedia(newReverbMedia);
      }
    }
    if (!reverbNode) {
      try {
        newReverbNode = audioContext.createConvolver();
        const arrayBuffer = toArrayBuffer(
          await window.electron.file.readAsBuffer(
            window.electron.file.getWavFileForReverbPath()
          )
        );
        newReverbNode.buffer = await audioContext.decodeAudioData(arrayBuffer);
        setReverbNode(newReverbNode);
      } catch (err) {
        setAlertMessage({
          message:
            'reverb error: impulses_impulse_rev.wav not found, reinstall application to restore file',
          severity: 'error',
        });
        setShowAlertMessage(true);
      }
    }
    if (reverbMedia && reverbNode) {
      reverbMedia
        .connect(reverbNode)
        .connect(reverbGainNode)
        .connect(audioContext.destination);
      setReverbEnabled(true);
    } else if (newReverbMedia && reverbNode) {
      newReverbMedia
        .connect(reverbNode)
        .connect(reverbGainNode)
        .connect(audioContext.destination);
      setReverbEnabled(true);
    } else if (newReverbMedia && newReverbNode) {
      newReverbMedia
        .connect(newReverbNode)
        .connect(reverbGainNode)
        .connect(audioContext.destination);
      setReverbEnabled(true);
    }
  };

  const disableReverb = () => {
    setReverbEnabled(false);
    if (reverbNode) {
      reverbNode.disconnect();
    }
    if (reverbMedia) {
      reverbMedia.disconnect();
    }
    reverbGainNode.disconnect();
  };

  const destroySources = () => {
    setReverbMedia(null);
    setMicrophoneMedia(null);
  };

  const disableMicrophone = () => {
    setMicrophoneEnabled(false);
    if (microphoneMedia) {
      microphoneMedia.disconnect();
    }
    microphoneGainNode.disconnect();
    disableReverb();
    destroySources();
  };

  const reverbVolumeChange = (_event: Event, newValue: number | number[]) => {
    setReverbVolume(newValue as number);
    reverbGainNode.gain.value = (newValue as number) / 100;
  };

  const microphoneVolumeChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    setMicrophoneVolume(newValue as number);
    microphoneGainNode.gain.value = (newValue as number) / 100;
  };

  const restoreDefaults = () => {
    disableMicrophone();
    setAudioInputId('default');
    setMicrophoneVolume(50);
    setReverbVolume(50);
  };

  const audioInputIdChange = (event: SelectChangeEvent<string>) => {
    setAudioInputId(event.target.value);
  };

  useEffect(() => {
    if (reverbEnabled) {
      disableMicrophone();
      setCallToEnableReverb(true);
    } else if (microphoneEnabled) {
      disableMicrophone();
      setCallToEnableMicrophone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInputId]);

  useEffect(() => {
    if (callToEnableMicrophone) {
      enableMicrophone();
      setCallToEnableMicrophone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callToEnableMicrophone]);

  useEffect(() => {
    if (callToEnableReverb) {
      enableReverb();
      setCallToEnableReverb(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callToEnableReverb]);

  return (
    <>
      <FormControl sx={{ width: 270, marginY: 1 }}>
        <Select
          value={
            audioInputDevices
              .map((device) => device.deviceId)
              .includes(audioInputId)
              ? audioInputId
              : ''
          }
          onChange={audioInputIdChange}
          defaultValue=""
          MenuProps={{ PaperProps: { sx: { maxHeight: 150 } } }}
        >
          {audioInputDevices.map((device) => {
            return (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Stack
        direction="row"
        sx={{ padding: '5px', width: '280px', paddingBottom: '0px' }}
      >
        <Typography>Microphone</Typography>
        <Switch
          checked={microphoneEnabled}
          onClick={() =>
            microphoneEnabled ? disableMicrophone() : enableMicrophone()
          }
          color="secondary"
          sx={{ bottom: '7px' }}
          data-testid={`toggle-microphone-${micNo}-switch`}
        />
        <Typography>Reverb</Typography>
        <Switch
          checked={reverbEnabled}
          onClick={() => (reverbEnabled ? disableReverb() : enableReverb())}
          color="secondary"
          sx={{ bottom: '7px' }}
          data-testid={`toggle-reverb-${micNo}-switch`}
        />
      </Stack>
      <Stack direction="row" sx={{ padding: '5px', width: '280px' }}>
        <Typography sx={{ width: '230px' }}>
          Volume: {microphoneVolume}%
        </Typography>
        <Slider
          aria-label="Volume"
          value={microphoneVolume}
          onChange={microphoneVolumeChange}
          min={0}
          max={100}
          color="secondary"
          data-testid={`microphone-${micNo}-volume-slider`}
        />
      </Stack>
      <Stack direction="row" sx={{ padding: '5px', width: '280px' }}>
        <Typography sx={{ width: '230px' }}>Reverb: {reverbVolume}%</Typography>
        <Slider
          aria-label="Volume"
          value={reverbVolume}
          onChange={reverbVolumeChange}
          min={0}
          max={100}
          color="secondary"
          data-testid={`microphone-${micNo}-reverb-slider`}
        />
      </Stack>
      <Tooltip title="restore defaults" placement="right">
        <IconButton
          onClick={restoreDefaults}
          sx={{ padding: 0 }}
          data-testid={`restore-microphone-${micNo}-defaults-button`}
        >
          <RestoreIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
    </>
  );
};

const MicrophoneMenu = ({
  open,
  anchorEl,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
}) => {
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
    setAudioInput1Id,
    audioInput2Id,
    setAudioInput2Id,
    microphone1GainNode,
    microphone2GainNode,
    microphone1Volume,
    setMicrophone1Volume,
    microphone2Volume,
    setMicrophone2Volume,
    reverb1Enabled,
    setReverb1Enabled,
    reverb2Enabled,
    setReverb2Enabled,
    reverb1Media,
    setReverb1Media,
    reverb2Media,
    setReverb2Media,
    reverb1Node,
    setReverb1Node,
    reverb2Node,
    setReverb2Node,
    reverb1GainNode,
    reverb2GainNode,
    reverb1Volume,
    setReverb1Volume,
    reverb2Volume,
    setReverb2Volume,
  } = useAudioStatus();
  const { setAlertMessage, setShowAlertMessage } = useAlertMessage();
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const getAudioInputDevices = async () => {
    const audioDevices = await navigator.mediaDevices
      .enumerateDevices()
      .then((devices) =>
        devices.filter((device) => device.kind === 'audioinput')
      );
    return audioDevices;
  };

  useEffect(() => {
    getAudioInputDevices()
      .then((devices) => setAudioInputDevices(devices))
      .catch((err) => console.log(err));
  }, []);

  const getMicrophoneMedia = async (audioInputId: string) => {
    let microphoneSource = null;

    try {
      microphoneSource = await navigator.mediaDevices
        .getUserMedia({
          audio: { deviceId: audioInputId },
          video: false,
        })
        .then((stream) => audioContext.createMediaStreamSource(stream));
    } catch (err) {
      setAlertMessage({
        message:
          'Cannot connect to selected microphone, please change input in settings',
        severity: 'error',
      });
      setShowAlertMessage(true);
    }
    return microphoneSource;
  };

  const toArrayBuffer = (buffer: Buffer) => {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; i += 1) {
      view[i] = buffer[i];
    }
    return ab;
  };

  const refreshAudioInputDevices = () => {
    getAudioInputDevices()
      .then((devices) => setAudioInputDevices(devices))
      .catch((err) => console.log(err));
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="top">
      <Paper
        sx={{
          padding: '20px',
        }}
      >
        <Tooltip
          title="Refresh microphone list, click if mic just plugged in"
          placement="right"
        >
          <IconButton
            onClick={refreshAudioInputDevices}
            sx={{ padding: 0 }}
            data-testid="refresh-audio-input-devices-button"
          >
            <RefreshIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
        <Stack direction="column" alignItems="center" justifyContent="center">
          <MicrophoneMenuElementsForEachMicrophone
            micNo={1}
            microphoneEnabled={microphone1Enabled}
            setMicrophoneEnabled={setMicrophone1Enabled}
            audioInputDevices={audioInputDevices}
            microphoneMedia={microphone1Media}
            setMicrophoneMedia={setMicrophone1Media}
            audioInputId={audioInput1Id}
            setAudioInputId={setAudioInput1Id}
            microphoneGainNode={microphone1GainNode}
            microphoneVolume={microphone1Volume}
            setMicrophoneVolume={setMicrophone1Volume}
            reverbEnabled={reverb1Enabled}
            setReverbEnabled={setReverb1Enabled}
            reverbMedia={reverb1Media}
            setReverbMedia={setReverb1Media}
            reverbNode={reverb1Node}
            setReverbNode={setReverb1Node}
            reverbGainNode={reverb1GainNode}
            reverbVolume={reverb1Volume}
            setReverbVolume={setReverb1Volume}
            getMicrophoneMedia={getMicrophoneMedia}
            toArrayBuffer={toArrayBuffer}
          />
          <Divider
            variant="middle"
            sx={{
              width: '100%',
              borderBottomWidth: 5,
              margin: 2,
            }}
          />
          <MicrophoneMenuElementsForEachMicrophone
            micNo={2}
            microphoneEnabled={microphone2Enabled}
            setMicrophoneEnabled={setMicrophone2Enabled}
            audioInputDevices={audioInputDevices}
            microphoneMedia={microphone2Media}
            setMicrophoneMedia={setMicrophone2Media}
            audioInputId={audioInput2Id}
            setAudioInputId={setAudioInput2Id}
            microphoneGainNode={microphone2GainNode}
            microphoneVolume={microphone2Volume}
            setMicrophoneVolume={setMicrophone2Volume}
            reverbEnabled={reverb2Enabled}
            setReverbEnabled={setReverb2Enabled}
            reverbMedia={reverb2Media}
            setReverbMedia={setReverb2Media}
            reverbNode={reverb2Node}
            setReverbNode={setReverb2Node}
            reverbGainNode={reverb2GainNode}
            reverbVolume={reverb2Volume}
            setReverbVolume={setReverb2Volume}
            getMicrophoneMedia={getMicrophoneMedia}
            toArrayBuffer={toArrayBuffer}
          />
        </Stack>
      </Paper>
    </Popper>
  );
};

const Microphone = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openMicrophoneMenu, setOpenMicrophoneMenu] = useState<boolean>(false);

  const clickToggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenMicrophoneMenu((state) => !state);
  };

  return (
    <>
      <Tooltip
        title={openMicrophoneMenu ? 'close mic settings' : 'open mic settings'}
        placement="right"
      >
        <IconButton
          onClick={clickToggleMenu}
          sx={{ position: 'fixed', bottom: 10, left: 60, padding: 0 }}
          data-testid="toggle-mic-settings-menu"
        >
          <MicIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
      <MicrophoneMenu open={openMicrophoneMenu} anchorEl={anchorEl} />
    </>
  );
};

export default Microphone;
