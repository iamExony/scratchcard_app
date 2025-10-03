"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsCardProps {
  title: string;
  value?: string;
  icon: LucideIcon;
  variant: "success" | "warning" | "info" | "transfer";
  background?: string;
  actionLabel?: string;
  onAction?: () => void;
  subLabel?: string;
}

const variantStyles = {
  success: "from-success to-success/80",
  warning: "from-warning to-warning/80",
  info: "from-info to-info/80",
  transfer: "from-transfer to-transfer/80",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant,
  background,
  actionLabel,
  onAction,
  subLabel,
}: StatsCardProps) {
  return (
    <Card className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${background}`}>
      <div className={`bg-gradient-to-br ${variantStyles[variant]} p-6 text-white relative `}>
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Icon className="h-32 w-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-1">{title}</h3>
          
          {value && (
            <p className="text-3xl font-bold mb-1">{value}</p>
          )}
          
          {subLabel && (
            <p className="text-sm text-white/80 mb-4">{subLabel}</p>
          )}
          
          {actionLabel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAction}
              className="bg-white/90 text-foreground hover:bg-white mt-2"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
