
"use client";
export const dynamic = "force-dynamic";

import { CardUpload } from "../../components/CardUpload";

export default function CardsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Card Management</h1>
        <p className="text-muted-foreground">Upload and manage scratch cards</p>
      </div>
      
      <CardUpload />
    </div>
  );
}