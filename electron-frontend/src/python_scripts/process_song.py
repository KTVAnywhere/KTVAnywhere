def demucs_separate(source, output):
    from demucs import separate
    from os import path, rmdir
    import shutil
    import multiprocessing

    cores = multiprocessing.cpu_count()
    model = "htdemucs"
    naming_format = "{stem}.{ext}"
    separate.main(['{}'.format(source), "-o", '{}'.format(output), "--filename", naming_format, "--two-stems=vocals", "--mp3", "--mp3-bitrate=64000", "-j={}".format(cores)])
    shutil.move(path.join(output, model, "vocals.mp3"), path.join(output, "vocals.mp3"))
    shutil.move(path.join(output, model, "no_vocals.mp3"), path.join(output, "accompaniment.mp3"))
    rmdir(path.join(output, model))



def basicpitch(source, output):
    from basic_pitch.inference import predict
    from basic_pitch import ICASSP_2022_MODEL_PATH
    from os import path
    from json import dump
    _, _, noteEvents = predict(
        source, ICASSP_2022_MODEL_PATH, 0.95, 0.3, 58, 80, 800, True)
    result = [{'startTimeSeconds': startTimeSeconds, 'durationSeconds': endTimeSeconds - startTimeSeconds, 'pitchMidi': int(pitchMidi),
               'amplitude': float(amplitude)} for startTimeSeconds, endTimeSeconds, pitchMidi, amplitude, _ in noteEvents]
    result.sort(key=lambda x: x.get('startTimeSeconds'))
    outputPath = path.join(output, 'graph.json')
    with open(outputPath, 'w') as outputFile:
        dump(result, outputFile)


def process_song(source, output, songId):
    import sys
    from os import path
    try:
        demucs_separate(source, output)
        basicpitch(path.join(output, 'vocals.mp3'), output)
        sys.stdout.write('done processing {}'.format(songId))
    except Exception as e:
        exception_message = '{}'.format(e)
        error_list = exception_message.split('\n')

        error_message = 'generic error message'
        test_string = "[Errno 2]"
        for err in error_list:
          if (len(err) >= len(test_string) and err[:len(test_string)] == test_string):
            error_message = 'input file does not exist'
        sys.stdout.write(error_message)


if __name__ == "__main__":
    from multiprocessing import freeze_support
    freeze_support()
    import sys
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')
    process_song(sys.argv[1], sys.argv[2], sys.argv[3])
