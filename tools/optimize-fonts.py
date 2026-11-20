"""A local subset for shipped UI; the untouched full variable font is fallback."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
chars=set(chr(i) for i in range(32,127))
for folder in ['app','public']:
    for path in (ROOT/folder).rglob('*'):
        if path.suffix in ['.php','.js'] and 'vendor' not in path.parts:
            chars.update(path.read_text(encoding='utf-8'))
chars.update('–—→←×…·₩“”‘’')
font=TTFont(ROOT/'public/assets/fonts/pretendard-variable.woff2')
full_codes=set(font.getBestCmap().keys())
options=subset.Options();options.flavor='woff2';options.layout_features=['*']
subsetter=subset.Subsetter(options=options);subsetter.populate(unicodes=[ord(c) for c in chars]);subsetter.subset(font)
font.flavor='woff2';font.save(ROOT/'public/assets/fonts/pretendard-ui.woff2')
codes=sorted(set(font.getBestCmap().keys()))
ranges=[];start=last=codes[0]
for code in codes[1:]:
    if code==last+1:last=code
    else:
        ranges.append(f'U+{start:X}' if start==last else f'U+{start:X}-{last:X}');start=last=code
ranges.append(f'U+{start:X}' if start==last else f'U+{start:X}-{last:X}')
css="@font-face{font-family:Unbounded;font-style:normal;font-weight:400 900;font-display:swap;src:url('/assets/fonts/unbounded-latin.woff2') format('woff2')}\n"
missing=sorted(full_codes-set(codes))
fallback_ranges=[]
if missing:
    start=last=missing[0]
    for code in missing[1:]:
        if code==last+1:last=code
        else:
            fallback_ranges.append(f'U+{start:X}' if start==last else f'U+{start:X}-{last:X}');start=last=code
    fallback_ranges.append(f'U+{start:X}' if start==last else f'U+{start:X}-{last:X}')
css+="@font-face{font-family:'Pretendard Variable';font-style:normal;font-weight:100 900;font-display:swap;src:url('/assets/fonts/pretendard-variable.woff2') format('woff2');unicode-range:"+','.join(fallback_ranges)+"}\n"
css+="@font-face{font-family:'Pretendard Variable';font-style:normal;font-weight:100 900;font-display:swap;src:url('/assets/fonts/pretendard-ui.woff2') format('woff2');unicode-range:"+','.join(ranges)+"}\n"
(ROOT/'public/assets/fonts.css').write_text(css,encoding='utf-8')
print('Subset glyphs:',len(codes),'Bytes:',(ROOT/'public/assets/fonts/pretendard-ui.woff2').stat().st_size,'Variable:', 'fvar' in font)
