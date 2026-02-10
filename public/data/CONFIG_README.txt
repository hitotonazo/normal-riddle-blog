BGMをR2で配信する場合:
1) R2に bgm/front.mp3 と bgm/back.mp3 を置く（推奨: mp3）
2) public/data/config.json の bgm.baseUrl に、そのフォルダの公開URLを設定
   例: https://<bucket>.<account>.r2.dev/blog-assets/bgm
   → baseUrl が設定されていれば front.mp3 / back.mp3 を自動参照します。
3) もしくは bgm.frontUrl / bgm.backUrl に完全なURLを直書きでもOK。

注意: ブラウザの自動再生制限のため、初回はクリック/スクロール等の操作後に再生されます。
