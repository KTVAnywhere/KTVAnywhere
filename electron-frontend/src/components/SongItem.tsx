import { Dispatch, SetStateAction, useState } from 'react';

export interface SongProps {
  songName: string;
  singer: string;
  songPath: string;
  lyricsPath: string;
}

const SongComponent = (song: SongProps) => {
  const { songName, singer, songPath, lyricsPath } = song;
  return (
    <div>
      <p>{songName}</p>
      <p>{singer}</p>
      <p>{songPath}</p>
      <p>{lyricsPath}</p>
    </div>
  );
};

export const SongLibrary = ({ songs }: { songs: SongProps[] }) => {
  return (
    <div>
      <h2>Song library</h2>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Song</th>
            <th>Singer</th>
            <th>Song path</th>
            <th>Lyrics path</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr>
              <td>{index + 1}</td>
              <td>{song.songName}</td>
              <td>{song.singer}</td>
              <td>{song.songPath}</td>
              <td>{song.lyricsPath}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SongUpload = ({
  songs,
  setSongList,
}: {
  songs: SongProps[];
  setSongList: Dispatch<SetStateAction<SongProps[]>>;
}) => {
  const [song, setSong] = useState<SongProps>({} as SongProps);

  const handleSongUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSongList([...songs, song]);
    setSong({ songName: '', singer: '', songPath: '', lyricsPath: '' });
  };

  return (
    <>
      <div>
        <h2>Add new song</h2>
        <form onSubmit={handleSongUpload}>
          <fieldset>
            <label htmlFor="songName">
              Song name:
              <input
                type="text"
                value={song?.songName}
                onChange={(event) =>
                  setSong({ ...song, songName: event.target.value })
                }
              />
            </label>
            <br />
            <label htmlFor="singer">
              Singer:
              <input
                type="text"
                value={song?.singer}
                onChange={(event) =>
                  setSong({ ...song, singer: event.target.value })
                }
              />
            </label>
            <br />
            <label htmlFor="songPath">
              Song path:
              <input
                type="text"
                value={song?.songPath}
                onChange={(event) =>
                  setSong({ ...song, songPath: event.target.value })
                }
              />
            </label>
            <br />
            <label htmlFor="Lyrics path">
              Lyrics path:
              <input
                type="text"
                value={song?.lyricsPath}
                onChange={(event) =>
                  setSong({ ...song, lyricsPath: event.target.value })
                }
              />
            </label>
          </fieldset>

          <input type="submit" value="Upload" />
        </form>
      </div>
    </>
  );
};

export default SongComponent;
