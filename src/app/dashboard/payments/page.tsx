"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, CalendarIcon, X } from "lucide-react";
import { format, parse, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "../components/DashboardLayout";

interface Transaction {
  id: number;
  waecPin: string;
  necoToken: string;
  nabtebPin: string;
  necoCard: string;
  nbaisPin: string;
  waecVerificationPin: string;
  reference: string;
  date: string;
  status: "successful" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    waecPin: "2143-5678-9012",
    necoToken: "NECO4567890",
    nabtebPin: "NABT-1234-5678",
    necoCard: "NC-987654",
    nbaisPin: "NBAIS-456789",
    waecVerificationPin: "WV-123456",
    reference: "TnxID52410325445",
    date: "28-04-2024 11:19:59 am",
    status: "successful",
  },
  {
    id: 2,
    waecPin: "3456-7890-1234",
    necoToken: "NECO7890123",
    nabtebPin: "NABT-5678-9012",
    necoCard: "NC-654321",
    nbaisPin: "NBAIS-789012",
    waecVerificationPin: "WV-789012",
    reference: "TnxID88263898535",
    date: "19-02-2024 04:26:59 pm",
    status: "successful",
  },
  {
    id: 3,
    waecPin: "5678-9012-3456",
    necoToken: "NECO0123456",
    nabtebPin: "NABT-9012-3456",
    necoCard: "NC-321098",
    nbaisPin: "NBAIS-012345",
    waecVerificationPin: "WV-345678",
    reference: "TnxID72901710299",
    date: "31-01-2024 04:17:18 pm",
    status: "pending",
  },
  {
    id: 4,
    waecPin: "7890-1234-5678",
    necoToken: "NECO3456789",
    nabtebPin: "NABT-3456-7890",
    necoCard: "NC-098765",
    nbaisPin: "NBAIS-345678",
    waecVerificationPin: "WV-901234",
    reference: "TnxID82742150259",
    date: "23-01-2024 11:13:30 am",
    status: "successful",
  },
  {
    id: 5,
    waecPin: "9012-3456-7890",
    necoToken: "NECO6789012",
    nabtebPin: "NABT-7890-1234",
    necoCard: "NC-765432",
    nbaisPin: "NBAIS-678901",
    waecVerificationPin: "WV-567890",
    reference: "TnxID77739806090",
    date: "22-01-2024 05:22:13 pm",
    status: "failed",
  },
  {
    id: 6,
    waecPin: "1357-2468-9753",
    necoToken: "NECO9876543",
    nabtebPin: "NABT-2468-1357",
    necoCard: "NC-135790",
    nbaisPin: "NBAIS-246813",
    waecVerificationPin: "WV-135790",
    reference: "TnxID99988877766",
    date: "15-01-2024 09:45:22 am",
    status: "successful",
  },
  {
    id: 7,
    waecPin: "8642-9753-1086",
    necoToken: "NECO1122334",
    nabtebPin: "NABT-9753-8642",
    necoCard: "NC-864297",
    nbaisPin: "NBAIS-975310",
    waecVerificationPin: "WV-864297",
    reference: "TnxID11223344556",
    date: "10-01-2024 02:30:15 pm",
    status: "successful",
  },
];

const statusVariants = {
  successful: "bg-success/10 text-success hover:bg-success/20",
  pending: "bg-warning/10 text-warning hover:bg-warning/20",
  failed: "bg-destructive/10 text-destructive hover:bg-destructive/20",
};

export default function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Filter transactions based on search term, status, and date range
  const filteredTransactions = mockTransactions.filter((transaction) => {
    // Search filter
    const matchesSearch = Object.values(transaction).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Status filter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      try {
        const transactionDate = parse(transaction.date, "dd-MM-yyyy hh:mm:ss a", new Date());
        if (dateFrom && dateTo) {
          matchesDate = isWithinInterval(transactionDate, { start: dateFrom, end: dateTo });
        } else if (dateFrom) {
          matchesDate = transactionDate >= dateFrom;
        } else if (dateTo) {
          matchesDate = transactionDate <= dateTo;
        }
      } catch (error) {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
      }
    }
    return pages;
  };

  return (

    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date);
                    setCurrentPage(1);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date);
                    setCurrentPage(1);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {(dateFrom || dateTo || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="h-10 px-3"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S/N</TableHead>
                <TableHead>Waec Pin</TableHead>
                <TableHead>Neco Token</TableHead>
                <TableHead>Nabteb Pin</TableHead>
                <TableHead>Neco Card</TableHead>
                <TableHead>Nbais Pin</TableHead>
                <TableHead>Waec Verification Pin</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction, index) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.waecPin}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.necoToken}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.nabtebPin}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.necoCard}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.nbaisPin}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.waecVerificationPin}</TableCell>
                    <TableCell className="text-muted-foreground">{transaction.reference}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{transaction.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className={statusVariants[transaction.status]}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} entries
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>

  );
}
