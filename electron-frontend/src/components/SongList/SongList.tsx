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
  TextField,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { SongProps, useSongDialog, useSongsStatus } from '../Song';
import { EnqueueSong } from '../SongsQueue';
import { useAudioStatus } from '../AudioPlayer/AudioStatus.context';

const SongCard = ({
  song,
  setOpenSong,
}: {
  song: SongProps;
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
}) => {
  const { setOpen: setOpenSongDialog } = useSongDialog();
  const { songsStatus, setSongsStatus } = useSongsStatus();
  const { setNextSong } = useAudioStatus();

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
          disabled={!!song.accompanimentPath}
          onClick={() => spleeterSeparateVocalsAndMusic()}
        >
          {song.accompanimentPath ? 'Done!' : 'Process'}
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
}: {
  setOpenSong: Dispatch<SetStateAction<SongProps>>;
}) => {
  const [songList, setSongList] = useState<SongProps[]>([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongProps[] | undefined>(
    []
  );

  useEffect(() => {
    setSongList(window.electron.store.songs.getAllSongs() ?? []);
    const songsUnsubscribe = window.electron.store.songs.onChange(
      (_, results) => {
        setSongList(results);
      }
    );
    return () => {
      songsUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (query) {
      window.electron.store.songs
        .search(query)
        .then((results) => setSearchResults(results))
        .catch(console.error);
    } else {
      setSearchResults(songList);
    }
  }, [query, songList]);

  const changeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };
  return (
    <Container>
      <Typography variant="h5" align="center" gutterBottom>
        Songs Library
      </Typography>
      <TextField
        aria-label="searchbox"
        size="small"
        variant="outlined"
        placeholder="Search songs"
        fullWidth
        value={query}
        onChange={changeQuery}
      />
      <List
        aria-label="data"
        sx={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {searchResults === undefined
          ? 'Loading...'
          : searchResults.map((song) => (
              <ListItem key={song.songId} sx={{ px: 0 }}>
                <SongCard song={song} setOpenSong={setOpenSong} />
              </ListItem>
            ))}
      </List>
    </Container>
  );
};

export default SongList;
