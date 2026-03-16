import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { adminAiRouter } from "./routes/admin-ai.routes.js";
import { config } from "./config.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { adminOrderRouter, orderRouter } from "./routes/order.routes.js";
import { categoryRouter, productRouter } from "./routes/product.routes.js";
import { swaggerSpec } from "./swagger.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

const allowedOrigins = new Set([
  config.frontendUrl,
  config.frontendUrl.replace("localhost", "host.docker.internal")
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    }
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/admin", adminRouter);
app.use("/admin/orders", adminOrderRouter);
app.use("/admin/ai", adminAiRouter);

app.use(errorHandler);
