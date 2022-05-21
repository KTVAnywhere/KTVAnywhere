/* eslint-disable @typescript-eslint/ban-types */
import React, { Component } from 'react';
import uniqid from 'uniqid';
import { emptySongProps, SongProps } from './SongItem';
import './Form.css';

interface FormErrorProps {
  songName: string;
  songPath: string;
  cancelled: string;
}

class SongUpload extends Component<
  {},
  { song: SongProps; error: FormErrorProps }
> {
  songUploadOptions: Electron.OpenDialogOptions = {
    filters: [
      {
        name: 'Audio',
        extensions: ['mp3', 'wav', 'm4a', 'wma'],
      },
    ],
    properties: ['openFile'],
  };

  lyricsUploadOptions: Electron.OpenDialogOptions = {
    filters: [
      {
        name: 'Lyrics',
        extensions: ['txt', 'lrc'],
      },
    ],
    properties: ['openFile'],
  };

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

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChooseFile = this.handleChooseFile.bind(this);
  }

  handleChange(newSong: SongProps) {
    this.setState((state) => ({ ...state, song: newSong }));
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { song } = this.state;

    if (!this.handleValidation()) {
      window.electron.store.songs.addSong({ ...song, songId: uniqid() });

      this.setState(this.emptyState);
    }
  }

  handleValidation() {
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

  handleChooseFile = async (
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

  render() {
    const { song, error } = this.state;
    const getFileName = (str: string) => str.replace(/^.*(\\|\/|:)/, '');
    return (
      <>
        <div>
          <form onSubmit={(event) => this.handleSubmit(event)}>
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
                    this.handleChange({
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
                    this.handleChange({
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
                    this.handleChooseFile(
                      this.songUploadOptions,
                      (path: string) =>
                        this.handleChange({ ...song, songPath: path })
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
                    this.handleChooseFile(
                      this.lyricsUploadOptions,
                      (path: string) =>
                        this.handleChange({ ...song, lyricsPath: path })
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

export default SongUpload;
