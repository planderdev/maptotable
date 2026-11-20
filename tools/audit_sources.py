"""Download read-only public source snapshots for the preservation audit."""
import concurrent.futures
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'docs' / 'original'
SOURCES = {
    'main.html': 'https://map-to-table.vercel.app/',
    'story.html': 'https://map-to-table.vercel.app/story.html?id=1',
    'join.html': 'https://map-to-table.vercel.app/join.html',
    'content.js': 'https://map-to-table.vercel.app/js/content.js',
    'main.js': 'https://map-to-table.vercel.app/js/main.js',
    'story.js': 'https://map-to-table.vercel.app/js/story.js',
    'join.js': 'https://map-to-table.vercel.app/js/join.js',
    'style.css': 'https://map-to-table.vercel.app/css/style.css',
    'design-system.html': 'https://map-to-table-ds.vercel.app/',
    'reference-dminusone.html': 'https://www.dminusone.com/',
    'reference-kanu.html': 'https://www.kanu.co.kr/limited-edition-2026kanubc',
}

def download(item):
    name, url = item
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
        (TARGET / name).write_bytes(data)
        return {'file': name, 'url': url, 'bytes': len(data)}
    except Exception as exc:
        return {'file': name, 'url': url, 'error': str(exc)}

if __name__ == '__main__':
    TARGET.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(download, SOURCES.items()))
    (TARGET / 'sources.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(results, ensure_ascii=True, indent=2))
