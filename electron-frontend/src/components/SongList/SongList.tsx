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
import { SongProps } from '../Song';
import { EnqueueSong } from '../SongsQueue';
import './SongList.module.css';

const deleteSong = (songId: string) => {
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
    <Card sx={{ width: 1 }}>
      <CardActionArea
        onClick={() => {
          setPopupTriggered(true);
          setOpenSong(song);
        }}
      >
        <CardContent sx={{ height: '40px' }}>
          <Typography noWrap variant="h5">
            {song.songName}
          </Typography>
          <Typography noWrap>{song.artist}</Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          onClick={() => deleteSong(song.songId)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

const SongList = ({
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
      <List
        aria-label="data"
        sx={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {window.electron.store.songs.getAllSongs().map((song) => (
          <ListItem key={song.songId} sx={{ px: 0 }}>
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

export default SongList;
