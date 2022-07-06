from PyInstaller.utils.hooks import collect_data_files, collect_submodules, collect_dynamic_libs
datas = collect_data_files('basic_pitch')
hiddenimports = collect_submodules('basic_pitch')
binaries = collect_dynamic_libs('basic_pitch')
