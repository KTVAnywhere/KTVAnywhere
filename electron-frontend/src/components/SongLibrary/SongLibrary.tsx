import {
  Button,
  CardActionArea,
  CardActions,
  CardContent,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import { Dispatch, SetStateAction } from 'react';
import { SongProps } from '../SongItem';
import { EnqueueSong } from '../SongsQueue';
import './SongLibrary.module.css';

const handleDelete = (songId: string) => {
  window.electron.store.songs.deleteSong(songId);
};

const SongCard = ({
  song,
  setPopupTriggered,
  setOpenSong,
  setNextSong,
}: {
  song: SongProps;
  setPopupTriggered: Dispatch<SetStateAction<boolean>>;
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
  setNextSong: Dispatch<SetStateAction<SongProps | null>>;
}) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea
        onClick={() => {
          setPopupTriggered(true);
          setOpenSong(song);
        }}
      >
        <CardContent>
          <Typography variant="h5">{song.songName}</Typography>
          <Typography>{song.artist}</Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          size="small"
          variant="contained"
          onClick={() => setNextSong(song)}
        >
          Play
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => EnqueueSong(song)}
        >
          Enqueue
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleDelete(song.songId)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

const SongLibrary = ({
  setPopupTriggered,
  setOpenSong,
  setNextSong,
}: {
  setPopupTriggered: Dispatch<SetStateAction<boolean>>;
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
  setNextSong: Dispatch<SetStateAction<SongProps | null>>;
}) => {
  return (
    <div>
      <h2>Song library</h2>
      <List aria-label="data">
        {window.electron.store.songs.getAllSongs().map((song) => (
          <ListItem disablePadding key={song.songId}>
            <SongCard
              song={song}
              setPopupTriggered={setPopupTriggered}
              setOpenSong={setOpenSong}
              setNextSong={setNextSong}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default SongLibrary;
