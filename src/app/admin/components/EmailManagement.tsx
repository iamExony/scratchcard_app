// components/admin/EmailManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Mail,
  Send,
  History,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  cardType: string;
  isActive: boolean;
  content?: string;
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: "SENT" | "FAILED" | "PENDING";
  cardType?: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  order?: {
    quantity: number;
    totalAmount: number;
  };
  error?: string;
}

export function EmailManagement() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    if (activeTab === "templates") {
      fetchTemplates();
    } else if (activeTab === "logs") {
      fetchEmailLogs();
    }
  }, [activeTab]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/email/templates");
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      toast.error("Failed to fetch email templates");
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch("/api/admin/email/logs");
      const data = await response.json();
      setEmailLogs(data.emailLogs || []);
    } catch (error) {
      toast.error("Failed to fetch email logs");
      throw error;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<EmailTemplate>) => {
    try {
      const response = await fetch("/api/admin/email/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, ...updates }),
      });

      if (!response.ok) throw new Error("Failed to update template");

      toast.success("Template updated successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to update template");
      throw error;
    }
  };

  const sendTestEmail = async (templateId: string) => {
    try {
      // This would send a test email to the admin
      toast.info(`Sending test email...\n${templateId}`);
      // Implement test email logic
    } catch (error) {
      toast.error("Failed to send test email");
      throw error;
    }
  };

  const statusIcons = {
    SENT: <CheckCircle className="h-4 w-4 text-green-500" />,
    FAILED: <XCircle className="h-4 w-4 text-red-500" />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
  };

  const statusColors = {
    SENT: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800", 
    PENDING: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
              <TabsTrigger value="logs">Email Logs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Email Templates Tab */}
            <TabsContent value="templates">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className={selectedTemplate?.id === template.id ? "border-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{template.name}</h3>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={template.isActive}
                              onCheckedChange={(checked) =>
                                updateTemplate(template.id, { isActive: checked })
                              }
                            />
                            <Label>{template.isActive ? "Active" : "Inactive"}</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm">Subject</Label>
                            <Input
                              value={template.subject}
                              onChange={(e) =>
                                setTemplates(prev =>
                                  prev.map(t =>
                                    t.id === template.id
                                      ? { ...t, subject: e.target.value }
                                      : t
                                  )
                                )
                              }
                              onBlur={() =>
                                updateTemplate(template.id, { subject: template.subject })
                              }
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendTestEmail(template.id)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Test Email
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Email Logs Tab */}
            <TabsContent value="logs">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Card Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No email logs found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        emailLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{log.user.name || "No Name"}</div>
                                <div className="text-sm text-muted-foreground">
                                  {log.recipient}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {log.subject}
                            </TableCell>
                            <TableCell>
                              {log.cardType ? (
                                <Badge variant="outline">{log.cardType}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {statusIcons[log.status]}
                                <Badge className={statusColors[log.status]}>
                                  {log.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(log.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Email Service Configuration</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>SMTP Host</Label>
                          <Input placeholder="smtp.gmail.com" />
                        </div>
                        <div>
                          <Label>SMTP Port</Label>
                          <Input placeholder="587" type="number" />
                        </div>
                      </div>
                      <div>
                        <Label>Sender Email</Label>
                        <Input placeholder="noreply@scratchcard.com" />
                      </div>
                      <div>
                        <Label>Sender Name</Label>
                        <Input placeholder="ResultPins" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Automation Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-send on order completion</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically send cards when order is marked as completed
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Send delivery confirmation</Label>
                          <p className="text-sm text-muted-foreground">
                            Send confirmation email when cards are delivered
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}