import { Button, Dialog, DialogContent } from '@mui/material';
import { Dispatch, ReactNode, SetStateAction } from 'react';

interface PopupProps {
  children: ReactNode;
  trigger: boolean;
  setTrigger: Dispatch<SetStateAction<boolean>>;
}

const Popup = ({ children, trigger, setTrigger }: PopupProps) =>
  trigger ? (
    <Dialog open onClose={() => setTrigger(false)}>
      <Button
        variant="outlined"
        onClick={() => setTrigger(false)}
        sx={{
          position: 'absolute',
          right: 10,
          top: 10,
        }}
      >
        X
      </Button>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  ) : (
    <></>
  );

export default Popup;
