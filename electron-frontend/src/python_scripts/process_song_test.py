import pathlib
from process_song import spleeter, basicpitch, process_song
from tempfile import TemporaryDirectory
from os.path import exists, join

DATA_PATH = pathlib.Path(__file__).parent / 'data'


def test_spleeter() -> None:
    with TemporaryDirectory() as output_path:
        spleeter(DATA_PATH / 'audio.wav', output_path)
        assert exists(join(output_path, 'vocals.mp3'))
        assert exists(join(output_path, 'accompaniment.mp3'))


def test_basicpitch() -> None:
    with TemporaryDirectory() as output_path:
        basicpitch(DATA_PATH / 'audio.wav', output_path)
        assert exists(join(output_path, 'graph.json'))
        with open(join(output_path, 'graph.json'), 'r') as output_file:
            with open(join(DATA_PATH, 'graph.json'), 'r') as expected_file:
                assert output_file.read() == expected_file.read()


def test_process_song() -> None:
    with TemporaryDirectory() as output_path:
        process_song(DATA_PATH / 'audio.wav', output_path, '123')
        assert exists(join(output_path, 'vocals.mp3'))
        assert exists(join(output_path, 'accompaniment.mp3'))
        basicpitch(join(output_path, 'vocals.mp3'), output_path)
        assert exists(join(output_path, 'graph.json'))


def test_file_not_found(capsys) -> None:
    with TemporaryDirectory() as output_path:
        process_song(DATA_PATH / 'wrong.wav', output_path, '123')
        out, _ = capsys.readouterr()
        print(out)
        assert out == 'input file does not exist'
