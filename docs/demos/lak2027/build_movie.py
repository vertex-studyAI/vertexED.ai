"""Build a captioned walkthrough from verify_demo.mjs screenshots."""
from pathlib import Path
import argparse
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('screenshots', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
folder = args.screenshots.resolve()
if args.output.exists():
    parser.error('output must be new')
for number in range(1, 6):
    if not (folder / f'movie-{number:02}.png').is_file():
        parser.error('run the browser verification before building the movie')
# Restrict concat/filter paths rather than attempting shell or ffmpeg escaping.
if any(char in str(folder) for char in "'\\:\n"):
    parser.error('use a simple screenshot path without quotes, colons or backslashes')
captions = folder / 'captions.srt'
captions.write_bytes(Path(__file__).with_name('captions.srt').read_bytes())
manifest = folder / 'frames.txt'
manifest.write_text(''.join(
    f"file '{folder}/movie-{i:02}.png'\nduration 22\n" for i in range(1, 6)
) + f"file '{folder}/movie-05.png'\n")
filters = (
    'pad=iw:ih+144:0:0:color=0x10203b,'
    f"subtitles={captions}:force_style='FontName=DejaVu Sans,FontSize=7,"
    "Alignment=2,MarginV=10,Outline=0',tpad=stop_mode=clone:stop_duration=1"
)
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
    '-i', str(manifest), '-vf', filters, '-t', '110', '-r', '10', '-c:v', 'libx264',
    '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(args.output),
], check=True)
