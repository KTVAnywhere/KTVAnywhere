import os
import sys
from spleeter.separator import Separator

def spleeter(source, output):
  sys.stdout.write('Starting spleeter for {}'.format(source))
  separator = Separator('spleeter:2stems')
  separator.separate_to_file('{}'.format(source), '{}'.format(output))
  sys.stdout.write('Spleeter done splitting for {}'.format(source))
  sys.stdout.write('\n')

if __name__ == "__main__":
  spleeter(sys.argv[1], sys.argv[2])
