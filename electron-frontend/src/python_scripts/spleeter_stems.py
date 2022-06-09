def spleeter(source, output, songId):
  try:
    separator = Separator('spleeter:2stems')
    separator.separate_to_file('{}'.format(source), '{}'.format(output), codec="mp3", bitrate="128k")
    sys.stdout.write('done splitting {}'.format(songId))
  except Exception as e:
    sys.stdout.write('error splitting {}'.format(songId))


if __name__ == "__main__":
  from multiprocessing import freeze_support
  freeze_support()
  from spleeter.separator import Separator
  import sys
  spleeter(sys.argv[1], sys.argv[2], sys.argv[3])
