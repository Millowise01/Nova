import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "@nova/design-system";

import { DataTable } from "./DataTable";

const meta = {
  title: "Dashboard/DataTable",
  component: DataTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Order {
  id: string;
  customer: string;
  status: string;
  amount: number;
  date: string;
  [key: string]: unknown;
}

const data: Order[] = Array.from({ length: 20 }, (_, i) => ({
  id: `#${1000 + i}`,
  customer: `Customer ${i + 1}`,
  status: ["Delivered", "Processing", "Pending", "Cancelled"][i % 4],
  amount: 49.99 + i * 12.5,
  date: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
}));

const statusTone: Record<string, "success" | "warning" | "neutral" | "error"> = {
  Delivered: "success",
  Processing: "warning",
  Pending: "neutral",
  Cancelled: "error",
};

export const Default: Story = {
  args: { columns: [], data: [], keyField: "id" },
  render: () => (
    <DataTable<Order>
      keyField="id"
      data={data.slice(0, 5)}
      columns={[
        { key: "id", header: "Order", sortable: true },
        { key: "customer", header: "Customer", sortable: true },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <Badge tone={statusTone[row.status]} size="sm">
              {row.status}
            </Badge>
          ),
        },
        {
          key: "amount",
          header: "Amount",
          sortable: true,
          align: "right",
          render: (row) => `$${row.amount.toFixed(2)}`,
        },
        { key: "date", header: "Date", sortable: true },
      ]}
    />
  ),
};

export const WithSearchAndPagination: Story = {
  args: { columns: [], data: [], keyField: "id" },
  render: () => (
    <DataTable<Order>
      keyField="id"
      data={data}
      searchable
      paginate
      pageSize={5}
      columns={[
        { key: "id", header: "Order", sortable: true },
        { key: "customer", header: "Customer", sortable: true },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <Badge tone={statusTone[row.status]} size="sm">
              {row.status}
            </Badge>
          ),
        },
        {
          key: "amount",
          header: "Amount",
          sortable: true,
          align: "right",
          render: (row) => `$${row.amount.toFixed(2)}`,
        },
        { key: "date", header: "Date" },
      ]}
    />
  ),
};

export const Loading: Story = {
  args: { columns: [], data: [], keyField: "id" },
  render: () => (
    <DataTable<Order>
      keyField="id"
      data={[]}
      loading
      columns={[
        { key: "id", header: "Order" },
        { key: "customer", header: "Customer" },
        { key: "status", header: "Status" },
        { key: "amount", header: "Amount" },
      ]}
    />
  ),
};
