import { useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { SongProps } from './SongItem';

export const QueueSearchBar = ({
  songs,
  setQueueItem,
}: {
  songs: SongProps[];
  setQueueItem: React.Dispatch<React.SetStateAction<SongProps>>;
}) => {
  const BarStyling = {
    width: '20rem',
    background: '#F2F1F9',
    border: 'none',
    padding: '0.5rem',
  };

  const [query, setQuery] = useState<string>('');
  const handleChange = (option: SongProps) => {
    setQueueItem(option);
  };

  return (
    <div>
      {/*
      <Select
        options={songs}
        getOptionLabel={(option) => option.songName}
        getOptionValue={(option) => option.songName}
        placeholder="Search.."
        onChange={setQueueItem}
      />
      <input
        style={BarStyling}
        placeholder="Search.."
        onChange={(e) => setQuery(e.target.value)}
      />
      {songs
        .filter((song) => {
          if (query === '') {
            return song;
            // eslint-disable-next-line no-else-return
          } else if (
            song.songName.toLowerCase().includes(query.toLowerCase()) ||
            song.singer.toLowerCase().includes(query.toLowerCase())
          ) {
            return song;
          }
          return undefined;
        })
        .map((song) => (
          <>
            <p>
              {song.songName} by {song.singer}
            </p>
          </>
        ))} */}
    </div>
  );
};

export default QueueSearchBar;
