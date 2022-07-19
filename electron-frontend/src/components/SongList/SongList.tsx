import {
  CardActionArea,
  CardActions,
  CardContent,
  Container,
  ListItem,
  Typography,
  Card,
  TextField,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QueueIcon from '@mui/icons-material/Queue';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { SongProps, useSongDialog, useSongsStatus } from '../Song';
import { EnqueueSong, QueueNotFull, MAX_QUEUE_LENGTH } from '../SongsQueue';
import { useAlertMessage } from '../AlertMessage';
import { useAudioStatus } from '../AudioStatus.context';
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
  const { setAlertMessage } = useAlertMessage();
  const {
    setOpen: setOpenConfirmation,
    setConfirmationMessage,
    setActions,
  } = useConfirmation();

  const isProcessed = () => {
    return !!(song.accompanimentPath && song.graphPath);
  };

  const processSong = () => {
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

  const enqueueSong = () => {
    if (QueueNotFull()) {
      EnqueueSong(song);
    } else {
      setAlertMessage({
        message: `Max queue length of ${MAX_QUEUE_LENGTH}`,
        severity: 'warning',
      });
    }
  };

  return (
    <Card sx={{ width: '280px', display: 'flex' }}>
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
            {isProcessed() && (
              <Chip label="Processed" color="primary" size="small" />
            )}
            {song.lyricsPath && (
              <Chip label="Lyrics" color="primary" size="small" />
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
          <Tooltip title="Play song" placement="right">
            <IconButton aria-label="play" onClick={() => setNextSong(song)}>
              <PlayArrowIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Enqueue song" placement="right">
            <IconButton aria-label="enqueue" onClick={enqueueSong}>
              <QueueIcon />
            </IconButton>
          </Tooltip>
          <LoadingButton
            size="small"
            loading={songsStatus.indexOf(song.songId) !== -1}
            onClick={processSong}
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
  const [searchResults, setSearchResults] = useState<SongProps[]>([]);
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    setSongList(window.electron.store.songs.getAllSongs() ?? []);
    const songsUnsubscribe = window.electron.store.songs.onChange(
      (_, results) => {
        setSongList(results);
      }
    );
    return () => songsUnsubscribe();
  }, []);

  useEffect(() => {
    if (query) {
      window.electron.store.songs
        .search(query)
        .then((results) => setSearchResults(results))
        .catch((error) =>
          setAlertMessage({
            message: `Searching error: ${error}`,
            severity: 'error',
          })
        );
    } else {
      setSearchResults(songList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, songList]);

  const changeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const listItems = ({
    data,
    index,
    style,
  }: {
    data: SongProps[];
    index: number;
    style: React.CSSProperties;
  }) => {
    const song = data[index];

    return (
      <ListItem key={song.songId} sx={{ pl: 0, pr: 1 }} style={style}>
        <SongCard song={song} setOpenSong={setOpenSong} />
      </ListItem>
    );
  };

  return (
    <Container sx={{ height: 'calc(100vh - 305px)' }}>
      <TextField
        aria-label="searchbox"
        size="small"
        variant="outlined"
        placeholder={`Search from ${songList.length} songs`}
        fullWidth
        value={query}
        onChange={changeQuery}
        sx={{ mb: 1 }}
      />
      {searchResults.length === 0 ? (
        <Typography
          textAlign="center"
          sx={{
            width: '305px',
            mt: '5%',
          }}
        >
          No songs found
        </Typography>
      ) : (
        <AutoSizer>
          {({ height }) => (
            <FixedSizeList
              height={height}
              width="305px"
              itemSize={140}
              itemData={searchResults}
              itemCount={searchResults.length}
            >
              {listItems}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </Container>
  );
};

export default SongList;
