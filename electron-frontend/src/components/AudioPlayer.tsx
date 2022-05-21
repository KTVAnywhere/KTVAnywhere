import { useState, Dispatch, SetStateAction } from 'react';
import './AudioPlayer.css';
import { QueueItemProps, DequeueSong } from './SongsQueue';

export const AudioPlayer = ({
  queue,
  setQueue,
}: {
  queue: QueueItemProps[];
  setQueue: Dispatch<SetStateAction<QueueItemProps[]>>;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongLocation, setCurrentSongLocation] = useState<string>();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    const song = DequeueSong(queue, setQueue);
    if (song === null) {
      return;
    }
    setCurrentSongLocation(song.songPath);
  };

  const playAudio = () => {
    const path = currentSongLocation;
    const audio = new Audio(path);
    const audioPromise = audio.play();
    if (audioPromise !== undefined) {
      audioPromise
        // eslint-disable-next-line promise/always-return
        .then(() => {
          // autoplay started
        })
        .catch(() => {
          // catch dom exception
        });
    }
  };

  return (
    <div className="audio-player">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        controls
        src="http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Samples/Goldwave/addf8-Alaw-GW.wav"
      />
      <button className="audio-controls" type="button">
        back 10
      </button>
      <button className="audio-controls" type="button">
        forward 10
      </button>
      {isPlaying === true ? (
        <button className="audio-controls" type="button" onClick={playAudio}>
          ||
        </button>
      ) : (
        <button
          className="audio-controls"
          type="button"
          onClick={handlePlayPause}
        >
          ▶
        </button>
      )}
      <div>0.00</div>
      <div>
        <input className="progress-bar" type="range" />
      </div>
      <div>2:00</div>
    </div>
  );
};

export default AudioPlayer;
