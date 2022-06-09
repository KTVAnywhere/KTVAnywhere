from PyInstaller.utils.hooks import collect_data_files, collect_submodules, collect_dynamic_libs
datas = collect_data_files('spleeter')
hiddenimports = collect_submodules('spleeter')
binaries = collect_dynamic_libs('spleeter')
