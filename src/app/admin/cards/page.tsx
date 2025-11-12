
"use client";
export const dynamic = "force-dynamic";
// app/admin/cards/page.tsx

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Package,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Image,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ScratchCard {
  id: string;
  type: "WAEC" | "NECO" | "NABTEB" | "NBAIS";
  pin: string;
  value: string;
  isImage: boolean;
  price: number;
  isUsed: boolean;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    reference: string;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCards: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Stats {
  totalCards: number;
  usedCards: number;
  availableCards: number;
  cardsByType: {
    WAEC: number;
    NECO: number;
    NABTEB: number;
    NBAIS: number;
  };
}

export default function ScratchCardsPage() {
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    usedCards: 0,
    availableCards: 0,
    cardsByType: { WAEC: 0, NECO: 0, NABTEB: 0, NBAIS: 0 },
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCards: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchCards = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/cards?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setCards(data.cards || []);
      setStats(data.stats || {});
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch scratch cards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    fetchCards(1);
  }, [fetchCards]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCards(1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("PIN copied to clipboard");
  };

  const exportCards = async () => {
    try {
      const response = await fetch("/api/admin/cards/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scratch-cards-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Cards exported successfully");
    } catch (error) {
      toast.error("Failed to export cards");
      throw new Error(`Export failed : ${error}`);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    fetchCards(1);
  };

  const getCardTypeColor = (type: string) => {
    const colors = {
      WAEC: "bg-blue-100 text-blue-800",
      NECO: "bg-green-100 text-green-800",
      NABTEB: "bg-purple-100 text-purple-800",
      NBAIS: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scratch Cards Management</h1>
          <p className="text-muted-foreground">
            View and manage all uploaded scratch cards
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCards}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fetchCards(pagination.currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{stats.availableCards}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Used</p>
                <p className="text-2xl font-bold">{stats.usedCards}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usage Rate</p>
                <p className="text-2xl font-bold">
                  {stats.totalCards > 0 ? Math.round((stats.usedCards / stats.totalCards) * 100) : 0}%
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.cardsByType || {}).map(([type, count]) => (
          <Card key={type}>
            <CardContent className="p-4 text-center">
              <Badge className={getCardTypeColor(type)}>
                {type}
              </Badge>
              <p className="text-2xl font-bold mt-2">{count}</p>
              <p className="text-sm text-muted-foreground">cards</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Scratch Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by PIN, card type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </form>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Card Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WAEC">WAEC</SelectItem>
                <SelectItem value="NECO">NECO</SelectItem>
                <SelectItem value="NABTEB">NABTEB</SelectItem>
                <SelectItem value="NBAIS">NBAIS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Cards Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scratch cards found</p>
              <p className="text-sm mt-1">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Upload some scratch cards to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card PIN/Token</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {card.pin}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(card.pin)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCardTypeColor(card.type)}>
                            {card.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ₦{card.price.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {card.isImage ? (
                              <>
                              {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                <Image className="h-4 w-4 text-blue-500"/>
                                <span className="text-sm">Image</span>
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Text</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {card.isUsed ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-20">
                              <XCircle className="h-3 w-3" />
                              Used
                            </Badge>
                          ) : (
                            <Badge variant="default" className="flex items-center gap-1 w-20">
                              <CheckCircle className="h-3 w-3" />
                              Available
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {card.order ? (
                            <div className="text-sm">
                              <div className="font-medium">{card.order.reference}</div>
                              <div className="text-muted-foreground">
                                {card.order.user.name || card.order.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(card.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(pagination.currentPage * 10, pagination.totalCards)} of{" "}
                    {pagination.totalCards} cards
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => fetchCards(pagination.currentPage - 1)}
                          className={
                            !pagination.hasPrev
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => fetchCards(page)}
                            isActive={pagination.currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => fetchCards(pagination.currentPage + 1)}
                          className={
                            !pagination.hasNext
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}