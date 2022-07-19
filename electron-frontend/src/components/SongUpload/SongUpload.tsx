/* eslint-disable @typescript-eslint/ban-types */
import { Button } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import uniqid from 'uniqid';
import { SongProps, emptySongProps } from '../Song';
import { useSongStagingDialog } from './SongStagingDialog.context';
import { useAlertMessage } from '../AlertMessage';
import './SongUpload.module.css';

interface SongUploadProps {
  setUploadedSongs: Dispatch<SetStateAction<SongProps[]>>;
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

const SongUploadButton = ({ setUploadedSongs }: SongUploadProps) => {
  const { setOpen: setOpenUploadDialog } = useSongStagingDialog();
  const { setAlertMessage } = useAlertMessage();
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
      .catch((error) => {
        if (
          error.message !==
          "Error invoking remote method 'dialog:openFiles': Error: Cancelled file selection"
        ) {
          setAlertMessage({
            message: `Upload error: ${error}`,
            severity: 'error',
          });
        }
      });
  };
  return (
    <Button
      sx={{ alignSelf: 'flex-end', my: '3%', right: 25 }}
      onClick={() => chooseSongs(songUploadOptions)}
    >
      Upload
    </Button>
  );
};

export default SongUploadButton;
