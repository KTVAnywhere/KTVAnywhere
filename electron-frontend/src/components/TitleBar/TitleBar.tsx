import { ButtonGroup, Container, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SquareOutlinedIcon from '@mui/icons-material/SquareOutlined';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { GetColorTheme } from '../Settings';

export const TITLE_BAR_HEIGHT = '22px';

const TitleBar = () => {
  const backgroundColor = GetColorTheme().audioPlayerBackground;

  const minimizeApp = () => {
    window.electron.window.minimizeApp();
  };

  const maximizeApp = () => {
    window.electron.window.maximizeApp();
  };

  const closeApp = () => {
    window.electron.window.closeApp();
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        height: TITLE_BAR_HEIGHT,
        backgroundColor,
        WebkitAppRegion: 'drag',
      }}
    >
      <Typography
        fontSize={12}
        sx={{
          position: 'absolute',
          height: TITLE_BAR_HEIGHT,
          top: 3,
          left: 10,
        }}
      >
        KTVAnywhere
      </Typography>
      <ButtonGroup
        sx={{
          position: 'absolute',
          height: TITLE_BAR_HEIGHT,
          right: 0,
          WebkitAppRegion: 'no-drag',
        }}
      >
        <IconButton
          onClick={minimizeApp}
          sx={{ borderRadius: 0, '&:hover': { backgroundColor: 'lightgrey' } }}
          data-testid="minimize-app-button"
        >
          <HorizontalRuleIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={maximizeApp}
          sx={{ borderRadius: 0, '&:hover': { backgroundColor: 'lightgrey' } }}
          data-testid="maximize-app-button"
        >
          <SquareOutlinedIcon sx={{ fontSize: 15 }} />
        </IconButton>
        <IconButton
          onClick={closeApp}
          sx={{ borderRadius: 0, '&:hover': { backgroundColor: 'red' } }}
          data-testid="close-app-button"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </ButtonGroup>
    </Container>
  );
};

export default TitleBar;
