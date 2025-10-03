"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: number;
  amount: number;
  reference: string;
  date: string;
  status: "successful" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    amount: 3500,
    reference: "TnxID52410325445",
    date: "28-04-2024 11:19:59 am",
    status: "successful",
  },
  {
    id: 2,
    amount: 3450,
    reference: "TnxID88263898535",
    date: "19-02-2024 04:26:59 pm",
    status: "successful",
  },
  {
    id: 3,
    amount: 1100,
    reference: "TnxID72901710299",
    date: "31-01-2024 04:17:18 pm",
    status: "successful",
  },
  {
    id: 4,
    amount: 1100,
    reference: "TnxID82742150259",
    date: "23-01-2024 11:13:30 am",
    status: "successful",
  },
  {
    id: 5,
    amount: 1100,
    reference: "TnxID77739806090",
    date: "22-01-2024 05:22:13 pm",
    status: "successful",
  },
];

const statusVariants = {
  successful: "bg-success/10 text-success hover:bg-success/20",
  pending: "bg-warning/10 text-warning hover:bg-warning/20",
  failed: "bg-destructive/10 text-destructive hover:bg-destructive/20",
};

export function TransactionsTable() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">S/N</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell className="font-semibold">₦{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.reference}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={statusVariants[transaction.status]}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
