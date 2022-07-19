import { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Song, { SongProps, useSongsStatus } from '../Song';
import { useSongStagingDialog } from './SongStagingDialog.context';
import { useConfirmation } from '../ConfirmationDialog';

interface SongUploadStagingDialogProps {
  uploadedSongs: SongProps[];
  setUploadedSongs: Dispatch<SetStateAction<SongProps[]>>;
}

const SongStagingDialog = ({
  uploadedSongs,
  setUploadedSongs,
}: SongUploadStagingDialogProps) => {
  const { setSongsStatus } = useSongsStatus();
  const { open, setOpen } = useSongStagingDialog();
  const {
    setOpen: setOpenConfirmation,
    setConfirmationMessage,
    setActions,
  } = useConfirmation();

  const uploadSongs = () => {
    setConfirmationMessage({
      heading: 'Upload songs',
      message:
        'Start processing songs after upload for pitch graph and vocals to be turned on/off?',
    });
    setActions([
      {
        label: 'No',
        fn: () => {
          setOpen(false);
          window.electron.store.songs.addSongs(uploadedSongs, true);
        },
      },
      {
        label: 'Yes',
        fn: () => {
          setOpen(false);
          window.electron.store.songs.addSongs(uploadedSongs, true);
          const uploadSongIds = uploadedSongs.map((song) => song.songId);
          setSongsStatus((previous) => [...previous, ...uploadSongIds]);
        },
      },
    ]);
    setOpenConfirmation(true);
  };

  const cancelUpload = () => {
    setConfirmationMessage({
      heading: 'Cancel upload',
      message: `Are you sure you want to cancel uploading ${
        uploadedSongs.length
      } ${uploadSongs.length > 1 ? 'songs' : 'song'}?`,
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
  };

  useEffect(() => {
    if (uploadedSongs.length === 0) {
      setOpen(false);
    }
  }, [uploadedSongs, setOpen]);

  const updateSong = (index: number) => (song: SongProps) => {
    setUploadedSongs((songs) => [
      ...songs.slice(0, index),
      song,
      ...songs.slice(index + 1),
    ]);
  };

  const deleteSong = (index: number) => {
    setUploadedSongs((songs) => [
      ...songs.slice(0, index),
      ...songs.slice(index + 1),
    ]);
  };

  return (
    <Dialog
      scroll="paper"
      open={open}
      onClose={cancelUpload}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Upload songs</DialogTitle>
      <DialogContent dividers>
        <List>
          {uploadedSongs.map((song, index) => (
            <ListItem
              divider
              key={song.songId}
              sx={{ display: 'flex', flexDirection: 'row' }}
            >
              <Song song={song} setSong={updateSong(index)} />
              <ListItemIcon>
                <Tooltip title="Remove">
                  <IconButton
                    aria-label="delete"
                    onClick={() => deleteSong(index)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button aria-label="cancel" onClick={() => cancelUpload()}>
          Cancel
        </Button>
        <Button aria-label="upload" onClick={uploadSongs}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SongStagingDialog;
