# s12kuma01.com

s12kuma01 の公式ホームページ。**Material 3 Expressive** に忠実準拠し、**訪問ごとに配色がランダムに変わる** Material ダイナミックカラー、デバイス追従のダーク/ライト、バネ物理のエクスプレッシブモーションを備えたトライリンガル (JA / EN / TH) 静的サイト。

## 技術スタック

- **[Astro 7](https://astro.build/)** — 静的出力、UI フレームワークなし (vanilla TS)
- **[@material/material-color-utilities](https://github.com/material-foundation/material-color-utilities)** — HCT ダイナミックカラー生成 (ビルド時に 36 テーマを事前計算)
- コンポーネントは全て手書き (`@material/web` は M3 Expressive 非対応のため)
- **Cloudflare Workers static assets** にデプロイ

## 開発環境の前提

このリポジトリは **`node` / `npm` / `npx` が PATH に無い** マシンで開発されています。**pnpm に統一**してください。

```powershell
# 必要なら pnpm の bin を PATH 前置き
$env:PATH = "$env:LOCALAPPDATA\pnpm\bin;" + $env:PATH
```

Node は pnpm 同梱のものが解決されるため、`package.json` の scripts 経由で全ツールが動きます (`pnpm exec` を使い、`npx` は使わない)。

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm install` | 依存インストール |
| `pnpm run gen` | トークン生成 (色 / モーション / boot スクリプト) |
| `pnpm run dev` | `gen` → 開発サーバー (http://localhost:4321) |
| `pnpm run build` | `gen` → 本番ビルド (`dist/`) |
| `pnpm run preview` | ビルド結果をローカル配信 |
| `pnpm run deploy` | `build` → `wrangler deploy` |
| `node scripts/gen-og.mjs` | OG 画像を再生成 (手動、コミット対象) |

> **注意:** pnpm は `pre*`/`post*` ライフサイクルフックをデフォルトで実行しません。トークン生成は `dev`/`build` スクリプト内で明示的にチェーンしてあります。`src/styles/generated/` は gitignore 済みで、ビルド時に必ず再生成されます。

## アーキテクチャの要点

- **トークンパイプライン** (`scripts/`): 36 色相分のダイナミックカラーを `SchemeVibrant(..., '2025')` でビルド時に CSS 化し、`:where(:root)` フォールバック + `[data-theme="i"]` ブロックとして出力。M3E スプリング 12 種は `linear()` イージングに変換。
- **テーマ起動** (`src/scripts/theme-boot.js` → 472B インライン): 最初のペイント前に `data-theme` を確定 (FOUC なし)。リロード / 新規訪問でのみ再抽選、サイト内遷移では sessionStorage で維持。スライダーでカスタムした色は `data-theme="live"` 番兵方式でカスケードを勝ち取る。
- **ヘッダー** (`src/components/Header.astro`): 単一ピルのフローティングアイランド + パレット由来の回転グロー (Neural Expressive 風)。テーマ調整ポップオーバーは MCU チャンクを初回開時に遅延ロード。
- **i18n**: `/` = JA、`/en/*`、`/th/*`。UI 文字列は型付き (`src/i18n/ui.ts`)、プロジェクトは content collection で 3 言語必須スキーマ。

詳細な設計と各フェーズの検証内容は [`PLAN.md`](./PLAN.md) を参照。

## デプロイ (Cloudflare Workers)

初回のみ Cloudflare へのログインが必要です:

```powershell
pnpm exec wrangler login   # ブラウザで認証
pnpm run deploy            # build して Workers static assets にデプロイ
```

設定は [`wrangler.jsonc`](./wrangler.jsonc)。`not_found_handling: "404-page"` により未知の URL は `dist/404.html` を **404 ステータス**で返します。カスタムドメイン (s12kuma01.com) は Cloudflare ダッシュボードの Workers Routes / Custom Domains で紐付けます。

## コンテンツの差し替え (オーナー向け)

プレースホルダーになっている箇所:

- `src/i18n/locales/{ja,en,th}.json` — 各言語の UI 文言(自己紹介・技術スタックなど)
- `src/content/projects/*.yaml` — プロジェクト(現在 Sumire-Labs の実プロジェクト5件)。`cover:` に画像を置くとカードに表示されます
- `src/consts.ts` — GitHub / Discord の URL
- OG 画像のタグラインは `scripts/gen-og.mjs` 内、変更後 `node scripts/gen-og.mjs` で再生成
