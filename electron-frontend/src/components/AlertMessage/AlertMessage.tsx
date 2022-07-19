import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect } from 'react';
import { useAlertMessage } from './Alert.context';

const AlertMessage = () => {
  const { showAlertMessage, setShowAlertMessage, alertMessage } =
    useAlertMessage();

  useEffect(() => {
    if (alertMessage.message !== '') {
      setShowAlertMessage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertMessage]);

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
            data-testid="close-alert-message-button"
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
