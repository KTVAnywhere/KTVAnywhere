import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useSongDialog } from './SongDialog.context';
import Song, { SongProps } from './Song';

interface SongDialogProps {
  song: SongProps;
  setSong: Dispatch<SetStateAction<SongProps>>;
}

const SongDialog = ({ song, setSong }: SongDialogProps) => {
  const { open, setOpen } = useSongDialog();

  const deleteSong = () => {
    window.electron.store.songs.deleteSong(song.songId);
    setOpen(false);
  };
  const saveSong = () => {
    window.electron.store.songs.setSong(song);
    setOpen(false);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Song details</DialogTitle>
      <DialogContent>
        <Song song={song} setSong={setSong} />
      </DialogContent>
      <DialogActions>
        <Button aria-label="close" onClick={() => setOpen(false)}>
          Close
        </Button>
        <Button aria-label="delete" color="warning" onClick={deleteSong}>
          Delete
        </Button>
        <Button aria-label="save" onClick={saveSong}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SongDialog;
