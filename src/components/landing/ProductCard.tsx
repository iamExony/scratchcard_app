"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoadingOverlay } from "./LoadingOverlay";
import { useEffect } from "react";

interface ProductCardProps {
  title: string;
  price: string;
  description: string;
  image: string;
  inStock?: boolean;
  id: string;
}

const ProductCard = ({ title, price, description, image, inStock = true, id }: ProductCardProps) => {
  const router = useRouter();
  const { show: showLoader, hide } = useLoadingOverlay();

  useEffect(() => {
    hide();
  }, [hide]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-border">
      <CardContent className="p-6">
        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
          <Image 
            src={image} 
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-card-foreground">{title}</h3>
            {inStock && (
              <Badge variant="secondary-hero" className="text-success bg-success/10 border-success/20">
                In Stock
              </Badge>
            )}
          </div>
          
          <p className="text-muted-foreground text-sm">{description}</p>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-primary-landing">{price}</span>
            <Button 
            size="sm" 
            className="bg-primary-landing hover:bg-primary-landing/80" 
            onClick={() => { showLoader(); router.push(`/${id}`); }}>
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
