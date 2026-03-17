# 小規模EC在庫管理システム

小規模商店向けの EC 在庫管理システムを、React + TypeScript、Node.js + Express、Prisma、MySQL で構築したフルスタック作品です。  
ユーザー向けの購買導線と、管理者向けの商品・在庫・注文管理導線を単一アプリ内で実装し、認証、権限制御、在庫整合性、トランザクション、API 設計、Docker 起動、テスト、自動ブラウザ検証までを一通り確認できます。  
加えて、管理者向けに自然言語で低在庫・注文・操作ログを照会し、日次の運営レポートを生成できる Admin AI Copilot を実装しています。

## プロジェクト概要

- ユーザー機能と管理機能を 1 つの Web システムで提供
- 注文作成時は Prisma transaction で在庫減算と注文作成を一括処理
- JWT による認証、ロールベースのアクセス制御を実装
- Docker Compose による一括起動に対応
- Swagger API ドキュメント、ER 図、アーキテクチャ図、ブラウザ smoke report を同梱
- Playwright によるブラウザ級の自動验收を追加済み
- Admin AI Copilot による自然言語照会と運営日報生成に対応

## 技術スタック

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Express, Prisma, JWT, Zod
- Database: MySQL 8
- Test: Jest, Vitest, Testing Library, Playwright
- Infra / Tooling: Docker Compose, GitHub Actions, Swagger UI

## 主要機能

### ユーザー側

- 商品一覧、商品詳細
- キーワード検索、カテゴリ絞り込み、ソート、ページング
- カート追加、数量変更、削除
- ユーザー登録、ログイン
- 注文作成、注文履歴確認

### 管理側

- 管理者ログイン
- 商品 CRUD
- 在庫更新
- 低在庫アラート表示
- 注文ステータス更新
- 操作ログ確認
- Admin AI Copilot
- 自然言語での低在庫 / 注文状態 / 操作ログ照会
- 今日日報の生成と日報履歴の確認

### システム面

- 注文と在庫減算の整合性を transaction で保証
- CORS / JWT / ロール制御
- 軽量メモリキャッシュ
- Prisma seed によるデモデータ投入
- Swagger REST API ドキュメント
- Playwright smoke test による E2E 検証
- `DailyReportSnapshot` による AI 日報スナップショット保存

## Admin AI Copilot

管理画面の `/admin/ai` から利用できる、読み取り専用の管理者向け Copilot です。  
既存の backend services と Prisma schema をできるだけ再利用しつつ、AI 専用の集約レイヤーを追加して自然言語クエリと日報生成を実現しています。

### 主な機能

- 自然言語で低在庫商品を照会
- 自然言語で注文状態を照会
- 自然言語で最近の操作ログを照会
- 今日日報の生成
- 保存済み日報の履歴確認

### 実装方針

- AI は読み取り専用で、在庫更新や注文ステータス変更は行わない
- LLM に直接 SQL を生成させず、既存 service の結果を要約する構成
- 日報は `DailyReportSnapshot` テーブルに保存し、再表示できる

### 主な API

- `POST /admin/ai/query`
- `POST /admin/ai/reports/daily`
- `GET /admin/ai/reports/daily`

## システムアーキテクチャ

- ユーザー画面と管理画面は単一の React SPA として提供
- Frontend は REST API 経由で Express backend と通信
- Backend は Prisma ORM 経由で MySQL にアクセス
- 商品一覧、商品詳細、低在庫一覧には軽量キャッシュを適用

詳細は [docs/architecture.md](docs/architecture.md) を参照してください。

## ER 図

詳細は [docs/er-diagram.md](docs/er-diagram.md) を参照してください。

## ディレクトリ構成

```text
.
├── backend
├── frontend
├── docs
├── tests
├── docker-compose.yml
├── playwright.config.ts
└── README.md
```

## 起動方法

### 前提

- Node.js 20+
- npm 10+
- Docker / Docker Compose

### 環境変数

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### ローカル起動

```bash
npm install
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
npm run dev --workspace backend
npm run dev --workspace frontend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`

### Docker Compose 起動

```bash
docker compose up --build
```

## テスト方法

### 型チェック / ユニットテスト / ビルド

```bash
npm run typecheck
npm run test
npm run build
```

### Playwright smoke test

前提:
- `backend` / `frontend` / `mysql` が起動済みであること

```bash
npm run test:smoke
```

ブラウザ smoke test では以下を確認します。

- ユーザーログイン
- 商品一覧表示
- カート追加
- 注文作成
- 管理者ログイン
- 注文ステータス更新

詳細は [docs/browser-smoke-report.md](docs/browser-smoke-report.md) を参照してください。

## 主要ドキュメント

- アーキテクチャ図: [docs/architecture.md](docs/architecture.md)
- ER 図: [docs/er-diagram.md](docs/er-diagram.md)
- API 概要: [docs/api-overview.md](docs/api-overview.md)
- ブラウザ smoke report: [docs/browser-smoke-report.md](docs/browser-smoke-report.md)

## デモアカウント

- 管理者: `admin@example.com / password123`
- 一般ユーザー: `yamada@example.com / password123`
- 一般ユーザー: `sato@example.com / password123`

## 关键截图

### 商品一覧

![商品一覧](docs/demo-screenshots/01-shop-products.png)

### カート

![カート](docs/demo-screenshots/02-cart.png)

### 注文履歴

![注文履歴](docs/demo-screenshots/03-order-history.png)

### 管理ダッシュボード

![管理ダッシュボード](docs/demo-screenshots/04-admin-dashboard.png)

### 管理注文画面

![管理注文画面](docs/demo-screenshots/05-admin-orders.png)

## 既知の制限

- 実決済、配送連携、通知連携は未実装
- Redis などの外部キャッシュは導入しておらず、キャッシュはアプリ内メモリのみ
- 最近閲覧履歴や推薦機能は未実装
- 在庫管理は単一倉庫前提
- 現状の Playwright smoke は最小導線の確認に絞っており、回帰網羅は限定的

## 今後の拡張

- 決済状態と疑似決済フローの追加
- 最近閲覧履歴、人気商品ランキングの強化
- Redis キャッシュ導入
- 操作ログ検索の高度化
- Playwright シナリオ拡充と CI 上での E2E 実行
- 本番向け監視 / エラートラッキング追加
