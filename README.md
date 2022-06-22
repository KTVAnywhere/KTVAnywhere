
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
- Audio player with key shifting functionality
- Lyrics player with basic adjustments with offset

### Proposed features
- Pitch graph and scoring

## Technologies

KTV Anywhere uses the following technlogies:

- [Electron] - Cross-platform desktop deployment
- [ReactJS] - For the application's frontend
- [spleeter] - For the vocal separation feature
- [SoundTouchJS] - For the pitch shifting functionality


## Installation
Download and install the latest release from the [releases page].
> Note: The vocal separation feature requires FFMPEG to be installed and added to path. You can skip this step if you already have FFMPEG or do not intend to use the vocal separation feature

#### FFMPEG installation instructions (Windows)

1. **Download**
* Goto their [website](https://ffmpeg.org/download.html#build-windows) and click on Windows builds from gyan.dev
* Under git master build, click on 'ffmpeg-git-essentials.7z'. The file should start downloading.
* After the zip file has finished downloading, unzip it to any directory *(eg. C:\Program Files)* 
2. **Add FFMPEG to path**
* Click on the start icon and search for 'Edit the system environment variables'. Click on the result that matches.
* Click on 'Edit Variables..'. A new window should pop up.
* Under system variables , look for the 'Path' variable and click 'Edit...'. A new window should pop up.
* Click on 'New' and add the path to ffmpeg\bin *(eg. C:\Program Files\ffmpeg\bin)*. 
* Click on 'OK' to close all the windows opened.


## Installation for development
This project requires:
* [NodeJS]
* [Python] > 3.8

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
npm run package:spleeter    # package python script with pyinstaller
npm run package             # package electron app with electron-builder
```
### Bugs
Spotted a bug? Please create a post on the [issues page]

### Acknowledgement

>(Hennequin et al. 2020)<br><br>
Hennequin, Romain, Anis Khlif, Felix Voituret, and Manuel Moussallam. 2020. “Spleeter: A Fast and Efficient Music Source Separation Tool with Pre-Trained Models.” Journal of Open Source Software 5 (50). The Open Journal: 2154. doi:10.21105/joss.02154.
```

   [releases page]: <https://github.com/weiquany/KTVAnywhere/releases>
   [issues page]: <https://github.com/weiquany/KTVAnywhere/issues>
   [Electron]: <https://www.electronjs.org/>
   [ReactJS]: <https://reactjs.org/>
   [spleeter]: <https://github.com/deezer/spleeter>
   [SoundTouchJS]: <https://github.com/cutterbl/SoundTouchJS>
   [NodeJS]: <https://nodejs.org/en/>
   [python]: <https://www.python.org/>

