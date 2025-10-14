// app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Mail,
  CreditCard,
  Globe,
  Shield,
  Bell,
  DollarSign,
  Users,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    supportEmail: string;
    currency: string;
    timezone: string;
  };
  pricing: {
    waecPrice: number;
    necoPrice: number;
    nabtebPrice: number;
    nbaisPrice: number;
    serviceCharge: number;
    stampDuty: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpFrom: string;
    autoSendEmails: boolean;
    emailNotifications: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    allowRegistrations: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  notifications: {
    newOrderNotification: boolean;
    lowStockAlert: boolean;
    systemAlerts: boolean;
    emailOnError: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: "ResultPins",
      siteDescription: "Your trusted scratch card provider",
      adminEmail: "admin@scratchcard.com",
      supportEmail: "support@scratchcard.com",
      currency: "NGN",
      timezone: "Africa/Lagos",
    },
    pricing: {
      waecPrice: 1000,
      necoPrice: 1000,
      nabtebPrice: 1000,
      nbaisPrice: 1000,
      serviceCharge: 50,
      stampDuty: 50,
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "noreply@scratchcard.com",
      smtpFrom: "noreply@scratchcard.com",
      autoSendEmails: true,
      emailNotifications: true,
    },
    security: {
      requireEmailVerification: false,
      allowRegistrations: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
    },
    notifications: {
      newOrderNotification: true,
      lowStockAlert: true,
      systemAlerts: true,
      emailOnError: true,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from API
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const testEmailConfig = async () => {
    try {
      const response = await fetch("/api/admin/settings/test-email", {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Email configuration test successful");
      } else {
        toast.error("Email configuration test failed");
      }
    } catch (error) {
      toast.error("Failed to test email configuration");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure your application settings and preferences
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic configuration for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings("general", { siteName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => updateSettings("general", { currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings("general", { siteDescription: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSettings("general", { adminEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSettings("general", { supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) => updateSettings("general", { timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>
                Set prices for your scratch cards and additional charges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waecPrice">WAEC Card Price (₦)</Label>
                  <Input
                    id="waecPrice"
                    type="number"
                    value={settings.pricing.waecPrice}
                    onChange={(e) => updateSettings("pricing", { waecPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="necoPrice">NECO Token Price (₦)</Label>
                  <Input
                    id="necoPrice"
                    type="number"
                    value={settings.pricing.necoPrice}
                    onChange={(e) => updateSettings("pricing", { necoPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="nabtebPrice">NABTEB Card Price (₦)</Label>
                  <Input
                    id="nabtebPrice"
                    type="number"
                    value={settings.pricing.nabtebPrice}
                    onChange={(e) => updateSettings("pricing", { nabtebPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="nbaisPrice">NBAIS Checker Price (₦)</Label>
                  <Input
                    id="nbaisPrice"
                    type="number"
                    value={settings.pricing.nbaisPrice}
                    onChange={(e) => updateSettings("pricing", { nbaisPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="serviceCharge">Service Charge (₦)</Label>
                  <Input
                    id="serviceCharge"
                    type="number"
                    value={settings.pricing.serviceCharge}
                    onChange={(e) => updateSettings("pricing", { serviceCharge: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="stampDuty">Stamp Duty (₦)</Label>
                  <Input
                    id="stampDuty"
                    type="number"
                    value={settings.pricing.stampDuty}
                    onChange={(e) => updateSettings("pricing", { stampDuty: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Pricing Preview</h4>
                <div className="text-sm space-y-1">
                  <div>WAEC Card: ₦{settings.pricing.waecPrice.toLocaleString()}</div>
                  <div>Service Charge: ₦{settings.pricing.serviceCharge.toLocaleString()}</div>
                  <div>Stamp Duty: ₦{settings.pricing.stampDuty.toLocaleString()}</div>
                  <div className="font-semibold pt-1 border-t">
                    Total: ₦{(settings.pricing.waecPrice + settings.pricing.serviceCharge + settings.pricing.stampDuty).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure your email service provider and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSettings("email", { smtpHost: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSettings("email", { smtpPort: parseInt(e.target.value) || 587 })}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    value={settings.email.smtpUser}
                    onChange={(e) => updateSettings("email", { smtpUser: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpFrom">From Email</Label>
                  <Input
                    id="smtpFrom"
                    type="email"
                    value={settings.email.smtpFrom}
                    onChange={(e) => updateSettings("email", { smtpFrom: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSendEmails">Auto-send Order Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically send scratch cards when orders are completed
                    </p>
                  </div>
                  <Switch
                    id="autoSendEmails"
                    checked={settings.email.autoSendEmails}
                    onCheckedChange={(checked) => updateSettings("email", { autoSendEmails: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for system events
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.email.emailNotifications}
                    onCheckedChange={(checked) => updateSettings("email", { emailNotifications: checked })}
                  />
                </div>
              </div>

              <Button onClick={testEmailConfig} variant="outline">
                Test Email Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security preferences and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistrations">Allow User Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register on the platform
                    </p>
                  </div>
                  <Switch
                    id="allowRegistrations"
                    checked={settings.security.allowRegistrations}
                    onCheckedChange={(checked) => updateSettings("security", { allowRegistrations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before purchasing
                    </p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSettings("security", { requireEmailVerification: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings("security", { sessionTimeout: parseInt(e.target.value) || 24 })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings("security", { maxLoginAttempts: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newOrderNotification">New Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new orders are placed
                    </p>
                  </div>
                  <Switch
                    id="newOrderNotification"
                    checked={settings.notifications.newOrderNotification}
                    onCheckedChange={(checked) => updateSettings("notifications", { newOrderNotification: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStockAlert">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts when scratch card inventory is low
                    </p>
                  </div>
                  <Switch
                    id="lowStockAlert"
                    checked={settings.notifications.lowStockAlert}
                    onCheckedChange={(checked) => updateSettings("notifications", { lowStockAlert: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemAlerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important system and maintenance alerts
                    </p>
                  </div>
                  <Switch
                    id="systemAlerts"
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => updateSettings("notifications", { systemAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailOnError">Email on Errors</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications when system errors occur
                    </p>
                  </div>
                  <Switch
                    id="emailOnError"
                    checked={settings.notifications.emailOnError}
                    onCheckedChange={(checked) => updateSettings("notifications", { emailOnError: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}