export type Pagination = {
  page: number;
  limit: number;
};

export type Payment = {
  id: number;
  name: string;
  email: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  reference: string;
  access_code: string;
  created_at: string;
  updated_at: string;
};
