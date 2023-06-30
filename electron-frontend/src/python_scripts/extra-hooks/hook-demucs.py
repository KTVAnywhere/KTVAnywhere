from PyInstaller.utils.hooks import collect_data_files, collect_submodules, collect_dynamic_libs
datas = collect_data_files('demucs')
hiddenimports = collect_submodules('demucs')
binaries = collect_dynamic_libs('demucs')
