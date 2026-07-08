# s12kuma01.com

s12kuma01 の公式ホームページ。**Material 3 Expressive** に忠実準拠し、**訪問ごとに配色がランダムに変わる** Material ダイナミックカラー、デバイス追従のダーク/ライト、バネ物理のエクスプレッシブモーションを備えたトライリンガル (JA / EN / TH) 静的サイト。

## 技術スタック

- **[Astro 7](https://astro.build/)** — 静的出力、UI フレームワークなし (vanilla TS)
- **[@material/material-color-utilities](https://github.com/material-foundation/material-color-utilities)** — HCT ダイナミックカラー生成 (ビルド時に 36 テーマを事前計算)
- コンポーネントは全て手書き (`@material/web` は M3 Expressive 非対応のため)
- **Cloudflare Workers static assets** にデプロイ

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
