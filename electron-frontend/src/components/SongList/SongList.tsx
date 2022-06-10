import {
  Button,
  CardActionArea,
  CardActions,
  CardContent,
  Container,
  List,
  ListItem,
  Typography,
  Card,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Dispatch, SetStateAction } from 'react';
import { SongProps, useSongDialog, useSongsStatus } from '../Song';
import { EnqueueSong } from '../SongsQueue';

const SongCard = ({
  song,
  setOpenSong,
  setNextSong,
}: {
  song: SongProps;
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
  setNextSong: Dispatch<SetStateAction<SongProps | null>>;
}) => {
  const { setOpen: setOpenSongDialog } = useSongDialog();
  const { songsStatus, setSongsStatus } = useSongsStatus();

  const spleeterSeparateVocalsAndMusic = async () => {
    setSongsStatus([...songsStatus, song.songId]);
  };
  return (
    <Card sx={{ width: 1 }}>
      <CardActionArea
        onClick={() => {
          setOpenSongDialog(true);
          setOpenSong(song);
        }}
      >
        <CardContent sx={{ height: '70px' }}>
          <Typography noWrap variant="h5">
            {song.songName}
          </Typography>
          <Typography noWrap>{song.artist}</Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          size="small"
          variant="contained"
          sx={{ minWidth: '70px' }}
          loading={songsStatus.indexOf(song.songId) !== -1}
          disabled={!!song.vocalsPath}
          onClick={() => spleeterSeparateVocalsAndMusic()}
        >
          {song.vocalsPath ? 'Done!' : 'Process'}
        </LoadingButton>
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
      </CardActions>
    </Card>
  );
};

const SongList = ({
  setOpenSong,
  setNextSong,
}: {
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
  setNextSong: Dispatch<SetStateAction<SongProps | null>>;
}) => {
  return (
    <Container>
      <Typography variant="h5" align="center" gutterBottom>
        Songs Library
      </Typography>
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
              setOpenSong={setOpenSong}
              setNextSong={setNextSong}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SongList;
