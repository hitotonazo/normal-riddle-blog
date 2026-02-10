# 記録（ARG用ブログ）— GitHub → Cloudflare Pages 公開

このリポジトリは **静的サイト（HTML/CSS/JS）** です。  
見た目は「普通の個人ブログ」に固定し、表/裏（front/back）の区別はUIに出しません。

---

## 1) フォルダ構成

- `public/` … Cloudflare Pages にデプロイする静的ファイル
  - `index.html` … 記事一覧（検索・タグ絞り込み）
  - `post.html` … 記事詳細（`?id=YYYY-MM-XX`）
  - `tags.html` … タグ一覧/タグ別記事
  - `data/posts.json` … 記事データ（差し替え前提）
  - `assets/` … CSS/JS

---

## 2) 記事データの差し替え

`public/data/posts.json` を **別紙（確定済み）** の内容で置き換えてください。  
データ形式（推奨）:

```json
{
  "date": "YYYY-MM",
  "type": "front | back",
  "title": "string",
  "body": "string",
  "tags": ["string"],
  "excerpt": "string",
  "readingTime": "1 min"
}
```

- `type` は内部用（UI表示しません）
- `body` は `\n` を含むプレーンテキストでもOK（このサイトは `pre-wrap` で表示）

---

## 3) Cloudflare Pages での公開

### 推奨（最小）
- Build command: **なし**
- Output directory: **public**

（つまり “Static site” としてそのまま配信）

---

## 4) R2 バケット（素材置き場）について

このZIPには、R2 にアップロードする想定のフォルダ構造サンプルも含めています（`../r2_bucket_structure/`）。

例：
- `public/images/` … 画像
- `public/pdf/` … PDF
- `public/media/` … 動画/音声など

### 参照方法（例）
R2 を Public URL（または Cloudflare のカスタムドメイン/パブリックバケット）で配信できる状態にした上で、
本文中に以下のようにURLを貼る運用を想定しています。

- 画像：`https://<YOUR-R2-DOMAIN>/images/example.jpg`
- PDF：`https://<YOUR-R2-DOMAIN>/pdf/example.pdf`

※このブログ側では「隠しリンク」や「謎」を作らない方針のため、素材リンクは **普通のブログの文脈で** 置いてください。

---

## 5) ローカル確認（任意）

VSCode の Live Server 等で `public/index.html` を開いて確認できます。  
fetch が動くように、簡易サーバで開くのが安全です（`file://` 直開きだと制限されることがあります）。

---

## 6) 重要ルール（この実装が守っている点）

- UIは明るくシンプル（ホラー演出なし）
- 表/裏の区別はテキストのみ（UIで鍵や色替えをしない）
- 隠しページ・謎解きはブログ内に直接置かない
