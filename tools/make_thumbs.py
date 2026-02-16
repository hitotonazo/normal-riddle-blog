#!/usr/bin/env python3
"""
R2に置くオリジナルPNGからサムネイルPNGを生成する簡易スクリプト。

使い方:
  python tools/make_thumbs.py --in ./r2_bucket_structure/blog-assets/images --out ./r2_bucket_structure/blog-assets/thumbnails --size 164 124

※ Pillow が必要:
  pip install pillow
"""
import argparse
from pathlib import Path
from PIL import Image

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True, help="入力フォルダ（YYYY-MM.png）")
    ap.add_argument("--out", dest="out", required=True, help="出力フォルダ（YYYY-MM.png）")
    ap.add_argument("--size", nargs=2, type=int, default=[164,124], help="サムネサイズ(px) 例: 164 124（2x推奨）")
    args = ap.parse_args()

    inp = Path(args.inp)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    w,h = args.size
    for p in sorted(inp.glob("*.png")):
        try:
            im = Image.open(p).convert("RGB")
            im.thumbnail((w,h), Image.LANCZOS)
            # 余白なしにフィットさせたい場合はここを拡張可
            dst = out / p.name
            im.save(dst, format="PNG", optimize=True)
            print("OK:", dst)
        except Exception as e:
            print("NG:", p, e)

if __name__ == "__main__":
    main()
