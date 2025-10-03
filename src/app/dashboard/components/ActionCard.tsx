"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  variant: "success" | "warning" | "info" | "transfer";
  background?: string;
  onAction?: () => void;
}

const variantStyles = {
  success: "from-success to-success/80",
  warning: "from-warning to-warning/80",
  info: "from-info to-info/80",
  transfer: "from-transfer to-transfer/80",
};

export function ActionCard({ title, icon: Icon, variant,background, onAction }: ActionCardProps) {
  return (
    <Card className={`overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 ${background}`}>
      <div
        onClick={onAction}
        className={`bg-gradient-to-br ${variantStyles[variant]} p-6 text-white flex items-center justify-between`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
          <span className="font-semibold text-lg">{title}</span>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/90 text-foreground hover:bg-white"
        >
          Click Here
        </Button>
      </div>
    </Card>
  );
}
