import React, { Component, Dispatch, SetStateAction } from 'react';
import uniqid from 'uniqid';
import { SongProps } from './SongItem';
import './Form.css';

export interface SongUploadProps {
  setSongList: Dispatch<SetStateAction<SongProps[]>>;
}

class SongUpload extends Component<SongUploadProps, SongProps> {
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

  constructor(props: SongUploadProps) {
    super(props);
    this.state = {
      songId: '',
      songName: '',
      artist: '',
      songPath: '',
      lyricsPath: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(_: React.ChangeEvent<HTMLInputElement>, newSong: SongProps) {
    this.setState(newSong);
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { setSongList } = this.props;

    setSongList((songList) => [
      ...songList,
      { ...this.state, songId: uniqid() },
    ]);
    this.setState({
      songId: '',
      songName: '',
      artist: '',
      songPath: '',
      lyricsPath: '',
    });
  }

  handleChooseFile = async (
    config: Electron.OpenDialogOptions,
    setPathFn: (arg0: string) => void
  ) => {
    window.electron.dialog
      .openFile(config)
      .then((result) => setPathFn(result))
      .catch((err) => console.log(err));
  };

  render() {
    const { songName, artist, songPath, lyricsPath } = this.state;
    const getFileName = (str: string) => str.replace(/^.*(\\|\/|:)/, '');
    return (
      <>
        <div>
          <form onSubmit={(event) => this.handleSubmit(event)}>
            <h2>Add new song</h2>
            <fieldset>
              <label htmlFor="songName">
                Name:
                <input
                  type="text"
                  required
                  data-testid="song-name-input"
                  value={songName}
                  onChange={(event) =>
                    this.handleChange(event, {
                      ...this.state,
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
                  value={artist}
                  onChange={(event) =>
                    this.handleChange(event, {
                      ...this.state,
                      artist: event.target.value,
                    })
                  }
                />
              </label>
              <br />
              <label htmlFor="songPath">
                Song file:
                <input
                  type="text"
                  data-testid="song-picker-input"
                  required
                  readOnly
                  value={getFileName(songPath)}
                />
                <button
                  type="button"
                  data-testid="song-picker-button"
                  onClick={() =>
                    this.handleChooseFile(
                      this.songUploadOptions,
                      (path: string) =>
                        this.setState((state) => ({ ...state, songPath: path }))
                    )
                  }
                >
                  Choose Song
                </button>
              </label>
              <br />
              <label htmlFor="Lyrics path">
                Lyrics file:
                <input type="text" readOnly value={getFileName(lyricsPath)} />
                <button
                  type="button"
                  data-testid="lyrics-picker-button"
                  onClick={() =>
                    this.handleChooseFile(
                      this.lyricsUploadOptions,
                      (path: string) =>
                        this.setState((state) => ({
                          ...state,
                          lyricsPath: path,
                        }))
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
