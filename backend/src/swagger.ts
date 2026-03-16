import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Small EC Inventory API",
      version: "1.0.0",
      description: "小規模EC在庫管理システムの REST API ドキュメント"
    },
    servers: [{ url: "http://localhost:4000" }],
    paths: {
      "/auth/register": { post: { summary: "一般ユーザー登録", responses: { "201": { description: "Created" } } } },
      "/auth/login": { post: { summary: "ログイン", responses: { "200": { description: "OK" } } } },
      "/auth/me": { get: { summary: "ログインユーザー情報", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
      "/products": { get: { summary: "商品一覧取得", responses: { "200": { description: "OK" } } } },
      "/products/{id}": {
        get: {
          summary: "商品詳細取得",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "OK" }, "404": { description: "Not Found" } }
        }
      },
      "/categories": { get: { summary: "カテゴリ一覧取得", responses: { "200": { description: "OK" } } } },
      "/cart": { get: { summary: "カート一覧取得", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
      "/cart/items": {
        post: { summary: "カート追加", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } }
      },
      "/cart/items/{id}": {
        patch: {
          summary: "カート数量更新",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "OK" } }
        },
        delete: {
          summary: "カート削除",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "204": { description: "No Content" } }
        }
      },
      "/orders": {
        post: { summary: "注文作成", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
        get: { summary: "注文履歴取得", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } }
      },
      "/orders/{id}": {
        get: {
          summary: "注文詳細取得",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "OK" } }
        }
      },
      "/admin/products": {
        get: { summary: "管理者用商品一覧", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
        post: { summary: "商品作成", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } }
      },
      "/admin/products/{id}": {
        patch: {
          summary: "商品更新",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "OK" } }
        },
        delete: {
          summary: "商品削除(非表示化)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "204": { description: "No Content" } }
        }
      },
      "/admin/products/{id}/inventory": {
        patch: {
          summary: "在庫更新",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "OK" } }
        }
      },
      "/admin/orders": { get: { summary: "注文一覧取得", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
      "/admin/orders/{id}/status": {
        patch: {
          summary: "注文状態更新",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "OK" } }
        }
      },
      "/admin/inventory/low-stock": {
        get: { summary: "低在庫一覧取得", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } }
      },
      "/admin/logs": { get: { summary: "操作ログ取得", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: []
});
