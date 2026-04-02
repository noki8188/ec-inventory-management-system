import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../state/AppContext";
import { Layout } from "../components/Layout";
import { App } from "../App";

describe("App", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    const localStorageMock = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      }
    };

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorageMock
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const payload = url.includes("/categories")
          ? [{ id: 1, name: "食品" }]
          : url.includes("/products")
            ? {
                items: [
                  {
                    id: 1,
                    name: "テスト商品",
                    description: "テスト用の商品です。",
                    price: 1200,
                    imageUrl: "https://example.com/product.png",
                    popularity: 10,
                    soldCount: 5,
                    status: "ACTIVE",
                    category: { id: 1, name: "食品" },
                    inventory: { stock: 12, lowStockThreshold: 3 }
                  }
                ]
              }
            : url.includes("/cart")
              ? []
              : { items: [] };

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders login navigation", async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("テスト商品")).toBeInTheDocument();
    expect(screen.getByText("ログイン")).toBeInTheDocument();
  });

  it("toggles the admin theme on admin pages", async () => {
    localStorage.setItem(
      "small-ec-user",
      JSON.stringify({ id: 1, email: "admin@example.com", name: "Admin", role: "ADMIN" })
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AppProvider>
          <Layout>
            <div>管理画面ダミー</div>
          </Layout>
        </AppProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "管理台 暗色模式" })).toBeInTheDocument();
    expect(document.querySelector(".app-shell")?.getAttribute("data-admin-theme")).toBe("light");

    await user.click(screen.getByRole("button", { name: "管理台 暗色模式" }));

    expect(screen.getByRole("button", { name: "管理台 浅色模式" })).toBeInTheDocument();
    expect(document.querySelector(".app-shell")?.getAttribute("data-admin-theme")).toBe("dark");
    expect(localStorage.getItem("small-ec-admin-theme")).toBe("dark");
  });
});
