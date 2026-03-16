export type Role = "USER" | "ADMIN";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type Category = {
  id: number;
  name: string;
};

export type Inventory = {
  stock: number;
  lowStockThreshold: number;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  popularity: number;
  soldCount: number;
  status: "ACTIVE" | "INACTIVE";
  category: Category;
  inventory?: Inventory;
};

export type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

export type OrderItem = {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  status: "CREATED" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
  user?: AuthUser;
};

export type OperationLog = {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  user: AuthUser;
};

export type AiIntent =
  | "low_stock_query"
  | "order_status_query"
  | "operation_log_query"
  | "daily_report_generate"
  | "unsupported";

export type AiDataCard = {
  title: string;
  value: string;
  description: string;
};

export type AdminAiQueryResponse = {
  intent: AiIntent;
  answer: string;
  dataCards: AiDataCard[];
  records: Array<Record<string, string | number | null>>;
  sources: string[];
  suggestions: string[];
  disclaimer: string;
};

export type DailyReportSection = {
  title: string;
  body: string;
};

export type DailyReportMetrics = {
  reportDate: string;
  totalOrders: number;
  totalRevenue: number;
  orderStatusBreakdown: Record<string, number>;
  lowStockCount: number;
  logCount: number;
  topProductNames: string[];
};

export type DailyReportSnapshot = {
  id: number;
  reportDate: string;
  summary: string;
  metrics: DailyReportMetrics;
  sections: DailyReportSection[];
  generatedAt: string;
  generatedBy: AuthUser;
};
