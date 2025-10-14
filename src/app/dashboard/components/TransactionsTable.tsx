/* "use client";
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
 */

"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "PURCHASE" | "WITHDRAWAL";
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference: string;
  createdAt: string;
  order?: {
    cardType: string;
    quantity: number;
    status: string;
  } | null;
}

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "text-blue-600 bg-blue-50";
      case "PURCHASE":
        return "text-purple-600 bg-purple-50";
      case "WITHDRAWAL":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading transactions...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 grid grid-cols-5 gap-4 p-4 text-sm font-medium">
          <div>Type</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Reference</div>
          <div>Date</div>
        </div>
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="grid grid-cols-5 gap-4 p-4 text-sm">
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                  {transaction.order && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.order.cardType} × {transaction.order.quantity}
                    </p>
                  )}
                </div>
                <div className="font-medium">
                  ₦{transaction.amount.toLocaleString()}
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {transaction.reference}
                </div>
                <div className="text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}