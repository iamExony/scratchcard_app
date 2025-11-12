// app/admin/email/page.tsx
"use client";
export const dynamic = "force-dynamic";



import { EmailManagement } from "../components/EmailManagement";

export default function EmailPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Management</h1>
        <p className="text-muted-foreground">
          Configure and monitor automated email delivery for scratch cards
        </p>
      </div>
      
      <EmailManagement />
    </div>
  );
}