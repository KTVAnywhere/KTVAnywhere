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
import { cyan } from '@mui/material/colors';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export interface ColorThemeProps {
  colorThemeId: number;
  name: string;
  mode: string;
  primary: string;
  secondary: string;
  mainPageBackground: string;
  paperBackground: string;
  sidebarBackground: string;
  audioPlayerBackground: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarHover: string;
  scrollbarActive: string;
}

const ColorThemes: ColorThemeProps[] = [
  {
    colorThemeId: 0,
    name: 'default',
    mode: 'dark',
    primary: '#86C232',
    secondary: '#61892F',
    mainPageBackground: '#6C6F6F',
    paperBackground: '#222629',
    sidebarBackground: '#474B4B',
    audioPlayerBackground: '#222629',
    scrollbarTrack: '#313535',
    scrollbarThumb: '#46513E',
    scrollbarHover: '#505C47',
    scrollbarActive: '#5A6850',
  },
  {
    colorThemeId: 1,
    name: 'ocean',
    mode: 'dark',
    primary: '#8DA9C4',
    secondary: '#EEF4ED',
    mainPageBackground: '#0E3158',
    paperBackground: '#0D2444',
    sidebarBackground: '#134074',
    audioPlayerBackground: '#0D2444',
    scrollbarTrack: '#0E3158',
    scrollbarThumb: cyan[800],
    scrollbarHover: cyan[700],
    scrollbarActive: cyan[600],
  },
  {
    colorThemeId: 2,
    name: 'sunset',
    mode: 'dark',
    primary: '#F1C75B',
    secondary: '#F5DA8E',
    mainPageBackground: '#FF6D56',
    paperBackground: '#B34C3D',
    sidebarBackground: '#A6703A',
    audioPlayerBackground: '#B34C3D',
    scrollbarTrack: '#6C520E',
    scrollbarThumb: '#F18D7E',
    scrollbarHover: '#F39E91',
    scrollbarActive: '#F5AEA3',
  },
  {
    colorThemeId: 3,
    name: 'pastel',
    mode: 'light',
    primary: '#DD5BEC',
    secondary: '#47404F',
    mainPageBackground: '#D1ADFF',
    paperBackground: '#D1ADFF',
    sidebarBackground: '#F6D0FF',
    audioPlayerBackground: '#F4C2FF',
    scrollbarTrack: '#ABA5B6',
    scrollbarThumb: '#F4C2FF',
    scrollbarHover: '#F8D6FF',
    scrollbarActive: '#FCEBFF',
  },
  {
    colorThemeId: 4,
    name: 'berry',
    mode: 'dark',
    primary: '#9AFEC0',
    secondary: '#E6EFE6',
    mainPageBackground: '#FFB8BC',
    paperBackground: '#B36B6E',
    sidebarBackground: '#724B4C',
    audioPlayerBackground: '#B36B6E',
    scrollbarTrack: '#634042',
    scrollbarThumb: '#FFADB1',
    scrollbarHover: '#FFC2C5',
    scrollbarActive: '#FFD6D8',
  },
];

export const GetColorTheme = () => {
  const currentId =
    window.electron.store.config.getSettings().colorThemeId ?? 0;
  return ColorThemes[currentId + 1 > ColorThemes.length ? 0 : currentId];
};

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
  const [colorThemeId, setColorThemeId] = useState(
    getCurrentSettings().colorThemeId ?? 0
  );

  useEffect(() => {
    window.electron.store.config.setSettings({
      errorMessagesTimeout,
      audioBufferSize,
      colorThemeId,
    });
  }, [errorMessagesTimeout, audioBufferSize, colorThemeId]);

  const errorTimeoutChange = (event: SelectChangeEvent<number>) => {
    setErrorMessagesTimeout(event.target.value as number);
  };

  const audioBufferSizeChange = (event: SelectChangeEvent<number>) => {
    setAudioBufferSize(event.target.value as number);
  };

  const colorThemeChange = (event: SelectChangeEvent<number>) => {
    setColorThemeId(event.target.value as number);
  };

  const closeDialog = () => {
    setShowSettings(false);
  };

  return (
    <Dialog
      scroll="paper"
      fullWidth
      maxWidth="sm"
      open={showSettings}
      onClose={closeDialog}
      sx={{ top: '15%', maxHeight: '600px' }}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Grid container paddingBottom={2}>
          <Grid
            item
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography sx={{ opacity: '90%' }}>Color theme</Typography>
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
                value={colorThemeId}
                onChange={colorThemeChange}
                renderValue={() => ColorThemes[colorThemeId].name}
              >
                {ColorThemes.map((_idx, index) => {
                  return (
                    <MenuItem
                      key={ColorThemes[index].colorThemeId}
                      value={index}
                    >
                      {ColorThemes[index].name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container paddingBottom={2}>
          <Grid
            item
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography sx={{ opacity: '90%' }}>
              Timeout for alert/error messages
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
                onChange={errorTimeoutChange}
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
        <Grid container paddingBottom={2}>
          <Grid
            item
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography sx={{ opacity: '90%' }}>Audio buffer size</Typography>
            <Typography
              variant="subtitle2"
              maxWidth={400}
              sx={{ opacity: '70%' }}
            >
              Increase if audio has static noise / crackles, but audio controls
              responsiveness may decrease. Requires restart.
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
                value={audioBufferSize || 4096}
                onChange={audioBufferSizeChange}
              >
                <MenuItem value={4096}>4 Kb</MenuItem>
                <MenuItem value={8192}>8 Kb</MenuItem>
                <MenuItem value={16384}>16 Kb</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} data-testid="close-settings-button">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsMenu;
