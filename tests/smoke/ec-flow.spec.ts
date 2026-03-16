import { expect, test } from "@playwright/test";

const screenshotDir = "docs/demo-screenshots";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("メールアドレス").fill(email);
  await page.getByPlaceholder("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
}

test("shop to admin smoke flow", async ({ page }) => {
  let createdOrderId = "";

  await login(page, "yamada@example.com", "password123");
  await expect(page.getByRole("heading", { name: "商品・注文・在庫をひとつの画面群で管理する小規模ECシステム" })).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(10);
  await page.screenshot({ path: `${screenshotDir}/01-shop-products.png`, fullPage: true });

  await page.getByRole("link", { name: "詳細を見る" }).first().click();
  await expect(page.getByRole("button", { name: "カートに追加" })).toBeVisible();
  await page.getByRole("button", { name: "カートに追加" }).click();
  await expect(page.getByText("カートに追加しました。")).toBeVisible();

  await page.getByRole("link", { name: /カート/ }).click();
  await expect(page.getByRole("heading", { name: "カート" })).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/02-cart.png`, fullPage: true });

  await page.getByRole("button", { name: "注文確認へ" }).click();
  await expect(page.getByRole("heading", { name: "注文確認" })).toBeVisible();
  await page.getByPlaceholder("受取人名").fill("山田太郎");
  await page.getByPlaceholder("電話番号").fill("09012345678");
  await page.getByPlaceholder("配送先住所").fill("東京都港区1-2-3");
  await page.getByRole("button", { name: "注文を作成" }).click();

  await expect(page).toHaveURL(/\/shop\/orders/);
  await expect(page.getByRole("heading", { name: "注文履歴" })).toBeVisible();
  const orderHeading = page.locator("strong").filter({ hasText: "注文 #" }).first();
  await expect(orderHeading).toBeVisible();
  createdOrderId = (await orderHeading.textContent())?.replace("注文 #", "").trim() ?? "";
  expect(createdOrderId).not.toBe("");
  await page.screenshot({ path: `${screenshotDir}/03-order-history.png`, fullPage: true });

  await page.getByRole("button", { name: /ログアウト/ }).click();
  await expect(page.getByRole("link", { name: "ログイン" })).toBeVisible();

  await login(page, "admin@example.com", "password123");
  await expect(page.getByRole("link", { name: "管理画面" })).toBeVisible();
  await page.getByRole("link", { name: "管理画面" }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.screenshot({ path: `${screenshotDir}/04-admin-dashboard.png`, fullPage: true });

  await page.getByRole("link", { name: "注文", exact: true }).click();
  await expect(page.getByRole("heading", { name: "注文管理" })).toBeVisible();
  const orderCard = page.locator("article").filter({ hasText: `注文 #${createdOrderId}` }).first();
  await expect(orderCard).toBeVisible();
  await orderCard.locator("select").selectOption("CONFIRMED");
  await expect(orderCard.locator("span.pill")).toHaveText("CONFIRMED");
  await page.screenshot({ path: `${screenshotDir}/05-admin-orders.png`, fullPage: true });
});
