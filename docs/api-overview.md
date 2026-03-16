# API 概要

## 認証

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## 公開 API

- `GET /products`
- `GET /products/:id`
- `GET /categories`

## ユーザー API

- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`

## 管理 API

- `GET /admin/products`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `DELETE /admin/products/:id`
- `PATCH /admin/products/:id/inventory`
- `GET /admin/orders`
- `PATCH /admin/orders/:id/status`
- `GET /admin/inventory/low-stock`
- `GET /admin/logs`

## 注文ステータス遷移

- `CREATED -> CONFIRMED`
- `CONFIRMED -> SHIPPED`
- `SHIPPED -> COMPLETED`
- `CREATED -> CANCELLED`
- `CONFIRMED -> CANCELLED`

詳細な request / response は Swagger UI (`/api/docs`) を参照してください。
