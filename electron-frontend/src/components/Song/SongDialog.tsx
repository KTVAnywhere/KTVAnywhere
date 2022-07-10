import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { useSongDialog } from './SongDialog.context';
import { useConfirmation } from '../ConfirmationDialog';
import Song, { SongProps } from './Song';

interface SongDialogProps {
  song: SongProps;
  setSong: Dispatch<SetStateAction<SongProps>>;
}

const SongDialog = ({ song, setSong }: SongDialogProps) => {
  const { open, setOpen } = useSongDialog();
  const songRef = useRef(song);
  const {
    setConfirmationMessage,
    setActions,
    setOpen: setOpenConfirmation,
  } = useConfirmation();

  useEffect(() => {
    if (open) {
      songRef.current = song;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const changeMade = () => {
    return JSON.stringify(songRef.current) !== JSON.stringify(song);
  };

  const closeDialog = () => {
    if (changeMade()) {
      setConfirmationMessage({
        heading: 'Unsaved changes',
        message:
          'There are some unsaved changes are you sure you want to exit?',
      });
      setActions([
        {
          label: 'Confirm',
          fn: () => {
            setOpen(false);
          },
        },
      ]);
      setOpenConfirmation(true);
    } else {
      setOpen(false);
    }
  };

  const deleteSong = () => {
    setConfirmationMessage({
      heading: 'Delete song',
      message: `Are you sure you want to delete "${song.songName}"?`,
    });
    setActions([
      {
        label: 'Confirm',
        fn: () => {
          window.electron.store.songs.deleteSong(song.songId);
          setOpen(false);
        },
      },
    ]);
    setOpenConfirmation(true);
  };
  const saveSong = () => {
    window.electron.store.songs.setSong(song);
    setOpen(false);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={() => closeDialog()}>
      <DialogTitle>Song details</DialogTitle>
      <DialogContent>
        <Song
          song={song}
          setSong={(state) => {
            setSong(state);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button aria-label="close" onClick={() => closeDialog()}>
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
