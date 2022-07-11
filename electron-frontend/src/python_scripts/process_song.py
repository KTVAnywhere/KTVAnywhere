def spleeter(source, output):
  separator = Separator('spleeter:2stems')
  naming_format = "{instrument}.{codec}"
  separator.separate_to_file('{}'.format(source), '{}'.format(output), codec="mp3", bitrate="128k", filename_format=naming_format)

def basicpitch(source, output):
  _, _, noteEvents = predict(source, ICASSP_2022_MODEL_PATH, 0.95, 0.3, 58, 80, 800, True)
  result = [{'startTimeSeconds': startTimeSeconds, 'durationSeconds': endTimeSeconds - startTimeSeconds, 'pitchMidi': int(pitchMidi), \
    'amplitude': float(amplitude)} for startTimeSeconds, endTimeSeconds, pitchMidi, amplitude, _ in noteEvents]
  result.sort(key=lambda x: x.get('startTimeSeconds'))
  outputPath = path.join(output, 'graph.json')
  with open(outputPath, 'w') as outputFile:
    dump(result, outputFile)

def process_song(source, output, songId):
  try:
    spleeter(source, output)
    basicpitch(path.join(output, 'vocals.mp3'), output)
    sys.stdout.write('done processing {}'.format(songId))
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
  from basic_pitch.inference import predict
  from basic_pitch import ICASSP_2022_MODEL_PATH
  import sys
  from os import path
  from json import dump
  process_song(sys.argv[1], sys.argv[2], sys.argv[3])
