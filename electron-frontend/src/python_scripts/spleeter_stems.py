def spleeter(source, output, songId):
  try:
    separator = Separator('spleeter:2stems')
    naming_format = "{instrument}.{codec}"
    separator.separate_to_file('{}'.format(source), '{}'.format(output), codec="mp3", bitrate="128k", filename_format=naming_format)
    sys.stdout.write('done splitting {}'.format(songId))
  except Exception as e:
    exception_message = '{}'.format(e)
    error_list = exception_message.split('\n')

    error_message = 'generic error message'
    if (len(error_list) >= 2 and error_list[len(error_list) - 2] == '{}: No such file or directory\r'.format(source)):
      error_message = 'input file does not exist'
    elif (error_list[0] == 'ffmpeg binary not found'):
      error_message = 'ffmpeg binary not found'

    sys.stdout.write(error_message)
  except:
    sys.stdout.write('generic error message')

if __name__ == "__main__":
  from multiprocessing import freeze_support
  freeze_support()
  from spleeter.separator import Separator
  import sys
  spleeter(sys.argv[1], sys.argv[2], sys.argv[3])
