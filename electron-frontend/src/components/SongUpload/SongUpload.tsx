/* eslint-disable @typescript-eslint/ban-types */
import { Button } from '@mui/material';
import { Component, Dispatch, SetStateAction, FormEvent } from 'react';
import uniqid from 'uniqid';
import {
  emptySongProps,
  lyricsPickerOptions,
  SongProps,
  songPickerOptions,
} from '../Song';
import { useSongStagingDialog } from './SongStagingDialog.context';
import './SongUpload.module.css';

interface SongUploadProps {
  setUploadedSongs: Dispatch<SetStateAction<SongProps[]>>;
}

interface FormErrorProps {
  songName: string;
  songPath: string;
  cancelled: string;
}

const songUploadOptions: Electron.OpenDialogOptions = {
  title: 'Select songs',
  buttonLabel: 'Add',
  filters: [
    {
      name: 'Audio',
      extensions: ['mp3', 'wav', 'm4a', 'wma'],
    },
  ],
  properties: ['openFile', 'createDirectory', 'multiSelections'],
};

export const SongUploadButton = ({ setUploadedSongs }: SongUploadProps) => {
  const { setOpen: setOpenUploadDialog } = useSongStagingDialog();
  const getFileName = (str: string) =>
    str.replace(/^.*(\\|\/|:)/, '').replace(/\.[^/.]+$/, '');
  const chooseSongs = (options: Electron.OpenDialogOptions) => {
    window.electron.dialog
      .openFiles(options)
      .then((songPaths) => window.electron.preprocess.getSongDetails(songPaths))
      .then((songDetails) =>
        songDetails.map((songDetail) => ({
          ...emptySongProps,
          songId: uniqid(),
          songName: songDetail.songName ?? getFileName(songDetail.songPath),
          artist: songDetail.artist ?? '',
          songPath: songDetail.songPath,
        }))
      )
      .then((results) => {
        setUploadedSongs(results);
        return setOpenUploadDialog(true);
      })
      .catch((error) => console.log(error));
  };
  return (
    <Button
      sx={{ alignSelf: 'flex-end', margin: '3%' }}
      onClick={() => chooseSongs(songUploadOptions)}
    >
      Upload
    </Button>
  );
};
class SongUploadForm extends Component<
  {},
  { song: SongProps; error: FormErrorProps }
> {
  emptyState: { song: SongProps; error: FormErrorProps } = {
    song: emptySongProps,
    error: {
      songName: '',
      songPath: '',
      cancelled: '',
    },
  };

  constructor(props: {}) {
    super(props);
    this.state = this.emptyState;

    this.changeSong = this.changeSong.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.chooseFile = this.chooseFile.bind(this);
  }

  chooseFile = async (
    config: Electron.OpenDialogOptions,
    setPathFn: (arg0: string) => void
  ) => {
    window.electron.dialog
      .openFile(config)
      .then((result) => setPathFn(result))
      .catch((err) =>
        this.setState((state) => ({
          ...state,
          error: { ...state.error, cancelled: err.message },
        }))
      );
  };

  changeSong(newSong: SongProps) {
    this.setState((state) => ({ ...state, song: newSong }));
  }

  submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { song } = this.state;

    if (!this.validateForm()) {
      window.electron.store.songs.addSong({ ...song, songId: uniqid() });

      this.setState(this.emptyState);
    }
  }

  validateForm() {
    const { song } = this.state;
    const { songName, songPath } = song;
    const error = { songName: '', songPath: '', cancelled: '' };
    let formIsInvalid = false;
    if (!songName) {
      formIsInvalid = true;
      error.songName = 'Please enter a song name';
    }

    if (!songPath) {
      formIsInvalid = true;
      error.songPath = 'Please select a song';
    }
    this.setState({ song, error });
    return formIsInvalid;
  }

  render() {
    const { song, error } = this.state;
    const getFileName = (str: string) => str.replace(/^.*(\\|\/|:)/, '');
    return (
      <>
        <div>
          <form onSubmit={(event) => this.submitForm(event)}>
            <h2>Add new song</h2>
            <fieldset>
              <label htmlFor="songName">
                <div style={{ color: 'red', textAlign: 'center' }}>
                  {error.songName}
                </div>
                Name:
                <input
                  type="text"
                  data-testid="song-name-input"
                  value={song.songName}
                  onChange={(event) =>
                    this.changeSong({
                      ...song,
                      songName: event.target.value,
                    })
                  }
                />
              </label>
              <br />
              <label htmlFor="artist">
                Artist:
                <input
                  type="text"
                  data-testid="artist-input"
                  value={song.artist}
                  onChange={(event) =>
                    this.changeSong({
                      ...song,
                      artist: event.target.value,
                    })
                  }
                />
              </label>
              <br />
              <label htmlFor="songPath">
                <div style={{ color: 'red', textAlign: 'center' }}>
                  {error.songPath}
                </div>
                Song file:
                <input
                  type="text"
                  data-testid="song-picker-input"
                  required
                  readOnly
                  value={getFileName(song.songPath)}
                />
                <button
                  type="button"
                  data-testid="song-picker-button"
                  onClick={() =>
                    this.chooseFile(songPickerOptions, (path: string) =>
                      this.changeSong({ ...song, songPath: path })
                    )
                  }
                >
                  Choose Song
                </button>
              </label>
              <br />
              <label htmlFor="Lyrics path">
                Lyrics file:
                <input
                  type="text"
                  data-testid="lyrics-picker-input"
                  readOnly
                  value={getFileName(song.lyricsPath)}
                />
                <button
                  type="button"
                  data-testid="lyrics-picker-button"
                  onClick={() =>
                    this.chooseFile(lyricsPickerOptions, (path: string) =>
                      this.changeSong({ ...song, lyricsPath: path })
                    )
                  }
                >
                  Choose lyrics
                </button>
              </label>
            </fieldset>
            <input type="submit" value="Upload" />
          </form>
        </div>
      </>
    );
  }
}

export default SongUploadForm;
