import {
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { Runner } from 'lrc-kit';
import { useEffect, useState } from 'react';
import { useLyrics } from './Lyrics.context';
import { useAudioStatus } from '../AudioStatus.context';
import { useAlertMessage } from '../AlertMessage';

const LyricsAdjust = () => {
  const { lyricsRunner, setLyricsRunner } = useLyrics();
  const { currentSong } = useAudioStatus();
  const [currentOffset, setCurrentOffset] = useState('0');
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    setCurrentOffset('0');
  }, [currentSong]);

  const changeLyricsOffset = (offsetString: string) => {
    const offset = offsetString ? parseFloat(offsetString) : 0;
    const prevOffset = currentOffset ? parseFloat(currentOffset) : 0;
    if (!Number.isNaN(offset)) {
      const newLyrics = lyricsRunner.lrc;
      newLyrics.offset(offset - prevOffset);
      setLyricsRunner(new Runner(newLyrics, true));
      setCurrentOffset(offsetString);
    }
  };

  const step = (stepAmount: number) => {
    changeLyricsOffset(
      (Number(currentOffset) + stepAmount).toFixed(1).toString()
    );
  };

  const saveOffset = () => {
    if (currentSong?.lyricsPath) {
      const lyricsPath = currentSong?.lyricsPath;
      const lyrics = lyricsRunner.lrc.toString();
      window.electron.file
        .write(lyricsPath, lyrics)
        .then(({ error }) => {
          if (error) {
            setAlertMessage({
              message: 'Error updating lyrics file',
              severity: 'warning',
            });
            return false;
          }
          setCurrentOffset('0');
          setAlertMessage({
            message: 'Successfully updated lyrics file',
            severity: 'success',
          });
          return true;
        })
        .catch((error) => {
          setAlertMessage({ message: error.message, severity: 'error' });
        });
    } else {
      setAlertMessage({ message: 'No lyrics file found', severity: 'info' });
    }
  };

  return (
    <>
      <Stack direction="column" alignItems="center" justifyContent="center">
        <Stack
          direction="row"
          spacing={0}
          alignItems="center"
          justifyItems="center"
        >
          <Tooltip title="Lyrics appearing too late" placement="top">
            <IconButton
              aria-label="stepDown"
              size="small"
              onClick={() => step(-0.2)}
            >
              <RemoveIcon fontSize="small" color="secondary" />
            </IconButton>
          </Tooltip>
          <TextField
            type="number"
            size="small"
            color="secondary"
            sx={{
              width: '40px',
              '& .MuiOutlinedInput-input': {
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                },
              },
            }}
            inputProps={{
              'data-testid': 'offset',
              step: '0.2',
              style: {
                textAlign: 'center',
                fontSize: '0.9em',
                padding: 3,
              },
            }}
            value={currentOffset}
            onChange={(event) => changeLyricsOffset(event.target.value)}
          />
          <Tooltip title="Lyrics appearing too early" placement="top">
            <IconButton
              aria-label="stepUp"
              size="small"
              onClick={() => step(0.2)}
            >
              <AddIcon fontSize="small" color="secondary" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack
          direction="row"
          justifyItems="center"
          sx={{ position: 'relative' }}
        >
          <Typography variant="subtitle2">offset (s)</Typography>
          <Tooltip title="Save changes" placement="right">
            <IconButton
              aria-label="saveOffset"
              onClick={saveOffset}
              size="small"
              sx={{ position: 'absolute', top: '0', left: '68px', p: 0 }}
            >
              <CheckOutlinedIcon fontSize="small" color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  );
};

export default LyricsAdjust;
