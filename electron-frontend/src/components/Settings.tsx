import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
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

  useEffect(() => {
    window.electron.store.config.setSettings({
      errorMessagesTimeout,
    });
  }, [errorMessagesTimeout]);

  const handleErrorTimeoutChange = (event: SelectChangeEvent<number>) => {
    setErrorMessagesTimeout(event.target.value as number);
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
            <DialogContentText>
              Set timeout for error messages
            </DialogContentText>
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
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsMenu;
