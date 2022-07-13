import { QuestionMark } from '@mui/icons-material';
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useConfirmation } from '../ConfirmationDialog';

const HelpMenu = () => {
  const sx: SxProps = {
    boxShadow: 5,
    minWidth: 30,
  };
  return (
    <List>
      <ListItem>
        <ListItemText primary="Play / Pause" />
        <ListItemSecondaryAction>
          <Chip size="small" label="SPACE" sx={sx} />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="End song" />
        <ListItemSecondaryAction>
          <Chip size="small" label="N" sx={sx} />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Adjust playback time" />
        <ListItemSecondaryAction>
          <Stack direction="row" spacing={0.5}>
            <Chip size="small" label="←" sx={sx} />
            <Typography>/</Typography>
            <Chip size="small" label="→" sx={sx} />
          </Stack>
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Adjust volume" />
        <ListItemSecondaryAction>
          <Stack direction="row" spacing={0.5}>
            <Chip size="small" label="↑" sx={sx} />
            <Typography>/</Typography>
            <Chip size="small" label="↓" sx={sx} />
          </Stack>
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Mute / Unmute" />
        <ListItemSecondaryAction>
          <Chip size="small" label="M" sx={sx} />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Adjust tempo" />
        <ListItemSecondaryAction>
          <Stack direction="row" spacing={0.5}>
            <Chip size="small" label="SHIFT" sx={sx} />
            <Chip size="small" label="←" sx={sx} />
            <Typography>/</Typography>
            <Chip size="small" label="SHIFT" sx={sx} />
            <Chip size="small" label="→" sx={sx} />
          </Stack>
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Adjust pitch" />
        <ListItemSecondaryAction>
          <Stack direction="row" spacing={0.5}>
            <Chip size="small" label="SHIFT" sx={sx} />
            <Chip size="small" label="↑" sx={sx} />
            <Typography>/</Typography>
            <Chip size="small" label="SHIFT" sx={sx} />
            <Chip size="small" label="↓" sx={sx} />
          </Stack>
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Toggle vocals" />
        <ListItemSecondaryAction>
          <Chip size="small" label="V" sx={sx} />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Toggle graph" />
        <ListItemSecondaryAction>
          <Chip size="small" label="G" sx={sx} />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemText primary="Toggle lyrics" />
        <ListItemSecondaryAction>
          <Chip size="small" label="L" sx={sx} />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

const HelpMenuButton = () => {
  const { setConfirmationMessage, setActions, setOpen } = useConfirmation();

  const openHelp = () => {
    setConfirmationMessage({
      heading: 'Keyboard shortcuts',
      message: <HelpMenu />,
    });
    setActions([]);
    setOpen(true);
  };

  return (
    <Tooltip title="Help">
      <IconButton onClick={openHelp}>
        <QuestionMark fontSize="medium" />
      </IconButton>
    </Tooltip>
  );
};

export default HelpMenuButton;
