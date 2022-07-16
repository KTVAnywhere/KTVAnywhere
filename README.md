# KTV Anywhere

#### A karaoke song system for everyone

[![Electron](https://github.com/weiquany/KTVAnywhere/actions/workflows/main.yml/badge.svg)](https://github.com/weiquany/KTVAnywhere/actions/workflows/main.yml)

Available for Windows OS

## Aim

While karaoke has been around for many years, casual singers usually go to karaoke joints instead of having a home karaoke system due to the high set-up cost and subscription service. Therefore, we hope to make a self-hosted karaoke song system that is easy to deploy for personal use. It would only require a working computer and songs the users already have. We hope to make it seamless and provide a fun and interactive karaoke experience for all ages.

### Implemented Features

- A queue system to manage songs
- Vocal separation from user-provided tracks
- Lyrics retrieval from NetEase Cloud Music
- Audio player with key shifting and tempo adjustment functionality
- Lyrics player with basic adjustments with offset
- Automatic pitch graph generation and display
- Up to 2 microphones supported with reverb and noise suppression

### Proposed features

- Pitch graph and scoring

## Technologies

KTV Anywhere uses the following technlogies:

- [Electron] - Cross-platform desktop deployment
- [ReactJS] - For the application's frontend
- [spleeter] - For the vocal separation feature
- [SoundTouchJS] - For the pitch shifting functionality
- [Basic Pitch] - For audio to pitch conversion
- [RNNoise] - For microphone noise suppression

## Installation

Download and install the latest release from the [releases page].

#### FFMPEG installation instructions (Windows)



### Installation for development

This project requires:

- [NodeJS]
- [Python] > 3.8
- [FFMPEG]

> [wiki page: ffmpeg installation instructions]

Setup

```sh
git clone https://github.com/weiquany/KTVAnywhere.git
cd ./KTVAnywhere/electron-frontend
npm install                                     # node modules
python -m pip install -r 'requirements.txt'     # python libraries
```

Starting the application

```sh
npm start
```

Packaging for current environment

```sh
npm run package:song-processor    # package python script with pyinstaller
npm run package                   # package electron app with electron-builder
```

### Bugs

Spotted a bug? Please create a post on the [issues page]

### Acknowledgement

>[1] Rachel M. Bittner, Juan José Bosch, David Rubinstein, Gabriel Meseguer-Brocal, and Sebastian Ewert. *A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation.* Proceedings of the IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP), 2022. 
<br/><br/>
>[2] Romain Hennequin, Anis Khlif, Felix Voituret, and Manuel Moussallam. *[Spleeter: a fast and efficient music source separation tool with pre-trained models.]* Journal of Open Source Software, 5, pp. 2154, 2020

[releases page]: https://github.com/weiquany/KTVAnywhere/releases
[issues page]: https://github.com/weiquany/KTVAnywhere/issues
[wiki page: ffmpeg installation instructions]: https://github.com/weiquany/KTVAnywhere/wiki/FFMPEG-Installation-instructions-for-Windows
[electron]: https://www.electronjs.org/
[reactjs]: https://reactjs.org/
[spleeter]: https://github.com/deezer/spleeter
[soundtouchjs]: https://github.com/cutterbl/SoundTouchJS
[basic pitch]: https://github.com/spotify/basic-pitch
[rnnoise]: https://github.com/xiph/rnnoise
[nodejs]: https://nodejs.org/en/
[python]: https://www.python.org/
[ffmpeg]: https://ffmpeg.org/
[Spleeter: a fast and efficient music source separation tool with pre-trained models.]: https://joss.theoj.org/papers/10.21105/joss.02154
