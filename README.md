
# KTV Anywhere
#### A karaoke song system for everyone
[![Electron](https://github.com/weiquany/KTVAnywhere/actions/workflows/main.yml/badge.svg)](https://github.com/weiquany/KTVAnywhere/actions/workflows/main.yml)
## Aim
While karaoke has been around for many years, casual singers usually go to karaoke joints instead of having a home karaoke system due to the high set-up cost and subscription service. Therefore, we hope to make a self-hosted karaoke song system that is easy to deploy for personal use. It would only require a working computer and songs the users already have. We hope to make it seamless and provide a fun and interactive karaoke experience for all ages.
### Implemented Features
- A basic CRUD to upload, delete and modify songs
- A queue system to manage songs you want to play
- Audio and lyrics player 

### Proposed features
- Removing vocals from user-provided tracks
- Fetching lyrics of song
- Key shifter 
- Pitch graph and scoring

## Technologies

KTV Anywhere uses the following technlogies:

- [Electron] - Cross-platform desktop deployment
- [ReactJS] - For the application's frontend


## Installation
Download and install the latest release from the [releases page].
> Note: Mac versions might not run as the application is not signed
## Installation for development

Setup
```sh
git clone https://github.com/weiquany/KTVAnywhere.git
cd ./KTVAnywhere/electron-frontend
npm install
```
Starting the application
```sh
npm start
```
Packaging for current environment
```sh
npm package 
```
### Bugs
Spotted a bug? Please create a post on the [issues page]

   [releases page]: <https://github.com/weiquany/KTVAnywhere/releases>
   [issues page]: <https://github.com/weiquany/KTVAnywhere/issues>
   [Electron]: <https://www.electronjs.org/>
   [ReactJS]: <https://reactjs.org/>

