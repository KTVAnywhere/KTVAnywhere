import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const SettingsMenu = ({
  showSettings,
  setShowSettings,
}: {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
}) => {
  const getCurrentSettings = () => window.electron.store.config.getSettings();
  const [errorMessagesTimeout, setErrorMessagesTimeout] = useState<number>(
    getCurrentSettings().errorMessagesTimeout
  );
  const [audioBufferSize, setAudioBufferSize] = useState<number>(
    getCurrentSettings().audioBufferSize
  );

  useEffect(() => {
    window.electron.store.config.setSettings({
      errorMessagesTimeout,
      audioBufferSize,
    });
  }, [audioBufferSize, errorMessagesTimeout]);

  const handleErrorTimeoutChange = (event: SelectChangeEvent<number>) => {
    setErrorMessagesTimeout(event.target.value as number);
  };

  const handleAudioBufferSizeChange = (event: SelectChangeEvent<number>) => {
    setAudioBufferSize(event.target.value as number);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={showSettings}
      onClose={() => setShowSettings(false)}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid
            item
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography sx={{ opacity: '90%' }}>
              Timeout for success/error messages
            </Typography>
          </Grid>
          <Grid
            item
            sx={{ marginLeft: 'auto' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <FormControl sx={{ minWidth: 100 }}>
              <Select
                value={errorMessagesTimeout}
                onChange={handleErrorTimeoutChange}
              >
                <MenuItem value={5}>5s</MenuItem>
                <MenuItem value={10}>10s</MenuItem>
                <MenuItem value={15}>15s</MenuItem>
                <MenuItem value={30}>30s</MenuItem>
                <MenuItem value={86400}>Never</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogContent>
        <Grid container>
          <Grid
            item
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography sx={{ opacity: '90%' }}>Audio buffer size</Typography>
            <Typography maxWidth={425} sx={{ opacity: '70%' }}>
              note: set higher if audio has static noise, but audio controls
              responsiveness may decrease
            </Typography>
          </Grid>
          <Grid
            item
            sx={{ marginLeft: 'auto' }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <FormControl sx={{ minWidth: 100 }}>
              <Select
                value={audioBufferSize}
                onChange={handleAudioBufferSizeChange}
              >
                <MenuItem value={4096}>4096</MenuItem>
                <MenuItem value={8192}>8192</MenuItem>
                <MenuItem value={16384}>16384</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsMenu;
