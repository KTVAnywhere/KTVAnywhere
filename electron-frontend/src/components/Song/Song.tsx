import { useState } from 'react';
import { EditText } from 'react-edit-text';
import 'react-edit-text/dist/index.css';
import { Button, Container, Typography } from '@mui/material';

export interface SongProps {
  songId: string;
  songName: string;
  artist: string;
  songPath: string;
  lyricsPath: string;
}

export const emptySongProps = {
  songId: '',
  songName: '',
  artist: '',
  songPath: '',
  lyricsPath: '',
};

export const songPickerOptions: Electron.OpenDialogOptions = {
  filters: [
    {
      name: 'Audio',
      extensions: ['mp3', 'wav', 'm4a', 'wma'],
    },
  ],
  properties: ['openFile'],
};

export const lyricsPickerOptions: Electron.OpenDialogOptions = {
  filters: [
    {
      name: 'Lyrics',
      extensions: ['txt', 'lrc'],
    },
  ],
  properties: ['openFile'],
};

const Song = ({ song }: { song: SongProps }) => {
  const [currSong, setCurrSong] = useState(song);

  const changeSong = (changedSong: SongProps) => {
    setCurrSong(changedSong);
  };

  const chooseFile = async (
    config: Electron.OpenDialogOptions,
    setPathFn: (arg0: string) => SongProps
  ) => {
    window.electron.dialog
      .openFile(config)
      .then((result) => setPathFn(result))
      .then((result) => {
        setCurrSong(result);
        return window.electron.store.songs.setSong(result);
      })
      .catch((err) => console.log(err));
  };

  const saveSong = (changedSong: SongProps) => {
    window.electron.store.songs.setSong(changedSong);
    setCurrSong(changedSong);
  };
  return (
    <Container sx={{ paddingTop: '5%' }}>
      <Container disableGutters>
        <Typography sx={{ fontWeight: 600 }}>Name: </Typography>
        <EditText
          placeholder="song name"
          value={currSong.songName}
          onChange={(value: string) =>
            changeSong({ ...currSong, songName: value })
          }
          style={{ border: 'groove', marginBottom: '2%' }}
          onSave={(event: {
            name: string;
            value: string;
            previousValue: string;
          }) => {
            saveSong({
              ...currSong,
              songName: event.value || event.previousValue,
            });
          }}
        />
      </Container>
      <Container disableGutters>
        <Typography sx={{ fontWeight: 600 }}>Artist: </Typography>
        <EditText
          placeholder="Enter song artist"
          value={currSong.artist}
          onChange={(value: string) =>
            changeSong({ ...currSong, artist: value })
          }
          style={{ border: 'groove', marginBottom: '2%' }}
          onSave={(event: {
            name: string;
            value: string;
            previousValue: string;
          }) => {
            saveSong({
              ...currSong,
              artist: event.value || event.previousValue,
            });
          }}
        />
      </Container>
      <Container disableGutters>
        <Typography sx={{ fontWeight: 600 }}>Path: </Typography>
        <Typography sx={{ mt: '1%' }}>{currSong.songPath}</Typography>
        <Button
          variant="outlined"
          data-testid="song-picker-button"
          sx={{ mt: '1%', mb: '2%' }}
          onClick={() =>
            chooseFile(songPickerOptions, (path) => ({
              ...currSong,
              songPath: path,
            }))
          }
        >
          change file
        </Button>
      </Container>
      <Container disableGutters>
        <Typography sx={{ fontWeight: 600 }}>Lyrics: </Typography>
        <Typography sx={{ mt: '1%' }}>{currSong.lyricsPath}</Typography>
        <Button
          variant="outlined"
          data-testid="lyrics-picker-button"
          sx={{ mt: '1%' }}
          onClick={() =>
            chooseFile(lyricsPickerOptions, (path) => ({
              ...currSong,
              lyricsPath: path,
            }))
          }
        >
          {currSong.lyricsPath ? 'change file' : 'upload file'}
        </Button>
      </Container>
    </Container>
  );
};

export default Song;
