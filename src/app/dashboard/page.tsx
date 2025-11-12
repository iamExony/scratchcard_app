"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { StatsCard } from "./components/StatsCard";
import { ActionCard } from "./components/ActionCard";
import { TransactionsTable } from "./components/TransactionsTable";
import { ProductPurchaseModal } from "./components/ProductPurchaseModal";
import { PaymentDetailsModal } from "./components/PaymentDetailsModal";
import { DepositModal } from "./components/DepositModal"; // New component
import { Wallet, Download, Upload, Send, Key, Ticket, CreditCard, Award } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import './theme.css'
import { useRouter } from "next/navigation";

interface UserStats {
  balance: number;
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
}

import { Suspense } from "react";

function DashboardPageInner() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false); // New state
  const [selectedProduct, setSelectedProduct] = useState({
    name: "",
    type: "",
    unitPrice: 1000
  });
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [userStats, setUserStats] = useState<UserStats>({
    balance: 0,
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    setDepositModalOpen(true);
  };

  const handleDepositSuccess = () => {
    toast.success("Deposit initiated successfully!");
    fetchUserStats(); // Refresh balance
    setDepositModalOpen(false);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "Deposit":
        handleDeposit();
        break;
      case "Withdraw":
        toast.info("Withdrawal feature coming soon!");
        break;
      case "Transfer":
        toast.info("Transfer feature coming soon!");
        break;
      case "View Statement":
        router.push("/dashboard/transactions");
        break;
      default:
        toast.success(`${action} clicked`);
    }
  };

  const handleProductClick = (productName: string, productType: string, unitPrice: number) => {
    setSelectedProduct({ name: productName, type: productType, unitPrice });
    setModalOpen(true);
  };

  const handleProceedToPayment = (quantity: number) => {
    setPurchaseQuantity(quantity);
    setPaymentModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    fetchUserStats(); // Refresh balance after purchase
    setPaymentModalOpen(false);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {session?.user?.name || "User"}! 👋
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="E-wallet Balance"
          value={`₦${userStats.balance.toLocaleString()}`}
          icon={Wallet}
          background="bg-success"
          variant="success"
          actionLabel="e-Statement"
          onAction={() => handleAction("View Statement")}
        />

        <StatsCard
          title="Deposit Money"
          icon={Download}
          variant="warning"
          background="bg-warning"
          actionLabel="Click here"
          subLabel="Fund your wallet instantly"
          onAction={handleDeposit}
        />

        <StatsCard
          title="Withdraw"
          icon={Upload}
          variant="info"
          background="bg-info"
          actionLabel="Click here"
          subLabel="Transfer to your bank"
          onAction={() => handleAction("Withdraw")}
        />

        <StatsCard
          title="Transfer to Users"
          icon={Send}
          variant="transfer"
          background="bg-transfer"
          actionLabel="Click here"
          subLabel="Send to other users"
          onAction={() => handleAction("Transfer")}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            title="Buy WAEC Scratch Card"
            icon={Key}
            variant="info"
            background="bg-info"
            onAction={() => handleProductClick("WAEC Pin", "WAEC", 3500)}
          />

          <ActionCard
            title="Buy NECO Token"
            icon={Ticket}
            variant="warning"
            background="bg-warning"
            onAction={() => handleProductClick("NECO Token", "NECO", 1000)}
          />

          <ActionCard
            title="Buy NABTEB Scratch Card"
            icon={CreditCard}
            variant="success"
            background="bg-success"
            onAction={() => handleProductClick("NABTEB Card", "NABTEB", 1500)}
          />

          <ActionCard
            title="Buy NBAIS Result Checker"
            icon={Award}
            variant="transfer"
            background="bg-transfer"
            onAction={() => handleProductClick("NBAIS Checker", "NBAIS", 1200)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsTable />

      <ProductPurchaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        productName={selectedProduct.name}
        productType={selectedProduct.type}
        onProceed={handleProceedToPayment}
      />

      <PaymentDetailsModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        productName={selectedProduct.name}
        productType={selectedProduct.type}
        quantity={purchaseQuantity}
        unitPrice={selectedProduct.unitPrice}
        userBalance={userStats.balance}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      <DepositModal
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageInner />
    </Suspense>
  );
}