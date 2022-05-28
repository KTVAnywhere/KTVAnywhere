/* eslint-disable @typescript-eslint/ban-types */
import React, { Component } from 'react';
import uniqid from 'uniqid';
import {
  emptySongProps,
  lyricsUploadOptions,
  SongProps,
  songUploadOptions,
} from '../Song';
import './SongUpload.module.css';

interface FormErrorProps {
  songName: string;
  songPath: string;
  cancelled: string;
}

class SongUpload extends Component<
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

  submitForm(event: React.FormEvent<HTMLFormElement>) {
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
                    this.chooseFile(songUploadOptions, (path: string) =>
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
                    this.chooseFile(lyricsUploadOptions, (path: string) =>
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

export default SongUpload;
