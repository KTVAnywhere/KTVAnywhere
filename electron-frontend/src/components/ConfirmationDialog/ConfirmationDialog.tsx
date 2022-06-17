import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useConfirmation } from './Confirmation.context';

const ConfirmationDialog = () => {
  const { confirmationMessage, actions, open, setOpen } = useConfirmation();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)}>
      {confirmationMessage.heading ? (
        <DialogTitle>{confirmationMessage.heading}</DialogTitle>
      ) : (
        <></>
      )}
      <DialogContent>
        <Typography>{confirmationMessage.message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button aria-label="Cancel" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {actions.map(({ label, fn }) => (
          <Button
            key={label}
            aria-label={label}
            onClick={() => {
              fn();
              setOpen(false);
            }}
          >
            {label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
