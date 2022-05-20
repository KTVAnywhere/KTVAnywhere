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

const SongComponent = ({ song }: { song: SongProps }) => {
  const { songName, artist, songPath, lyricsPath } = song;
  return (
    <div>
      <p>
        <strong>Name: </strong>
        {songName}
      </p>
      <p>
        <strong>Artist: </strong>
        {artist}
      </p>
      <p>
        <strong>Path: </strong>
        {songPath}
      </p>
      <p>
        <strong>Lyrics: </strong>
        {lyricsPath}
      </p>
    </div>
  );
};

export default SongComponent;
