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
