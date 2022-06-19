import {
  CardActionArea,
  CardActions,
  CardContent,
  Container,
  List,
  ListItem,
  Typography,
  Card,
  TextField,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QueuePlayNext from '@mui/icons-material/QueuePlayNext';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { SongProps, useSongDialog, useSongsStatus } from '../Song';
import { EnqueueSong } from '../SongsQueue';
import { useAudioStatus } from '../AudioPlayer';
import { useConfirmation } from '../ConfirmationDialog';

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
  const {
    setOpen: setOpenConfirmation,
    setConfirmationMessage,
    setActions,
  } = useConfirmation();

  const isProcessed = () => {
    return !!song.accompanimentPath;
  };

  const spleeterSeparateVocalsAndMusic = () => {
    if (isProcessed()) {
      setConfirmationMessage({
        heading: 'Process song',
        message: `${song.songName} has already been processed. Do you want to process it again?`,
      });
      setActions([
        {
          label: 'Confirm',
          fn: () => {
            setSongsStatus([...songsStatus, song.songId]);
            setOpenConfirmation(false);
          },
        },
      ]);
      setOpenConfirmation(true);
    } else {
      setSongsStatus([...songsStatus, song.songId]);
    }
  };
  return (
    <Card sx={{ width: 1, display: 'flex' }}>
      <CardActionArea
        sx={{
          width: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
        onClick={() => {
          setOpenSongDialog(true);
          setOpenSong(song);
        }}
      >
        <CardContent sx={{ width: 1, pr: 0 }}>
          <Typography variant="h5" noWrap>
            {song.songName}
          </Typography>
          <Typography sx={{ opacity: '60%' }} noWrap>
            {song.artist}
          </Typography>
          <Stack direction="row" spacing={1} pt="10px">
            {!isProcessed() ? (
              <></>
            ) : (
              <Chip label="Processed" color="success" size="small" />
            )}
            {!song.lyricsPath ? (
              <></>
            ) : (
              <Chip label="Lyrics" color="success" size="small" />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ width: '80px' }}>
        <Stack
          direction="column"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButton aria-label="play" onClick={() => setNextSong(song)}>
            <PlayArrowIcon fontSize="medium" />
          </IconButton>
          <IconButton aria-label="enqueue" onClick={() => EnqueueSong(song)}>
            <QueuePlayNext />
          </IconButton>
          <LoadingButton
            size="small"
            loading={songsStatus.indexOf(song.songId) !== -1}
            onClick={spleeterSeparateVocalsAndMusic}
          >
            Process
          </LoadingButton>
        </Stack>
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
          flexDirection: 'column',
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
