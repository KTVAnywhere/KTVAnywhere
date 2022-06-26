import { Alert, Button, Snackbar } from '@mui/material';
import { useAlertMessage } from './Alert.context';

const AlertMessage = () => {
  const { showAlertMessage, setShowAlertMessage, alertMessage } =
    useAlertMessage();
  return (
    <Snackbar
      open={showAlertMessage}
      autoHideDuration={
        window.electron.store.config.getSettings().errorMessagesTimeout * 1000
      }
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={(_event, reason) => {
        if (reason === 'clickaway') return;
        setShowAlertMessage(false);
      }}
    >
      <Alert
        variant="filled"
        severity={alertMessage.severity}
        action={
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => setShowAlertMessage(false)}
          >
            Close
          </Button>
        }
      >
        {alertMessage.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage;
