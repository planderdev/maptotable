import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'public/assets/fonts'
FONTS.mkdir(parents=True, exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()

css = fetch('https://fonts.googleapis.com/css2?family=Unbounded:wght@400..900&display=swap').decode()
urls = re.findall(r'url\((https://[^)]+)\)', css)
font_url = urls[-1]
(FONTS / 'unbounded-latin.woff2').write_bytes(fetch(font_url))
pretendard = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'
(FONTS / 'pretendard-variable.woff2').write_bytes(fetch(pretendard))
for name, url in [
    ('Unbounded-OFL.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/unbounded/OFL.txt'),
    ('Pretendard-OFL.txt', 'https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/LICENSE'),
]:
    try: (FONTS / name).write_bytes(fetch(url))
    except Exception as exc: print(name, str(exc))
(ROOT / 'docs/font-sources.json').write_text(json.dumps({'unbounded': font_url, 'pretendard': pretendard, 'weights': {'unbounded': '400-900', 'pretendard': '100-900'}}, indent=2), encoding='utf-8')
print('Downloaded local variable fonts.')
try:
    source = 'https://pixabay.com/videos/waves-water-sea-ocean-landscape-22183/'
    data = fetch(source).decode()
    (ROOT / 'docs/original/pixabay.html').write_text(data, encoding='utf-8')
    urls = sorted(set(re.findall(r'https[^\s"<>]+(?:\.mp4|\.jpg)[^\s"<>]*', data)))
    print(json.dumps(urls, indent=2))
except Exception as exc:
    print('Pixabay source:', str(exc))
