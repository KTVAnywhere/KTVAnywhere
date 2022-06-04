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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Song, { SongProps } from '../Song';
import { useSongStagingDialog } from './SongStagingDialog.context';

interface SongUploadStagingDialogProps {
  uploadedSongs: SongProps[];
  setUploadedSongs: Dispatch<SetStateAction<SongProps[]>>;
}

const SongStagingDialog = ({
  uploadedSongs,
  setUploadedSongs,
}: SongUploadStagingDialogProps) => {
  const { open, setOpen } = useSongStagingDialog();

  const uploadSongs = () => {
    window.document.body.focus();
    window.electron.store.songs.addSongs(uploadedSongs, true);
    setOpen(false);
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
    <Dialog fullWidth scroll="paper" open={open}>
      <DialogTitle>Upload songs</DialogTitle>
      <DialogContent dividers>
        <List>
          {uploadedSongs.map((song, index) => (
            <ListItem divider key={song.songId}>
              <Song song={song} setSong={() => updateSong(index)} />
              <ListItemIcon>
                <IconButton
                  aria-label="delete"
                  onClick={() => deleteSong(index)}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemIcon>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button aria-label="cancel" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button aria-label="upload" onClick={uploadSongs}>
          Upload songs
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SongStagingDialog;
