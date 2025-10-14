// components/admin/CardUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export function CardUpload() {
  const [cardType, setCardType] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isImageCard, setIsImageCard] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("text");
  const [textCards, setTextCards] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardTypes = [
    { value: "WAEC", label: "WAEC Scratch Card" },
    { value: "NECO", label: "NECO Token" },
    { value: "NABTEB", label: "NABTEB Pin" },
    { value: "NBAIS", label: "NBAIS Result Checker" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

 // In the handleTextUpload function of CardUpload component
const handleTextUpload = async () => {
  if (!cardType || !price || !textCards.trim()) {
    toast.error("Please fill all required fields");
    return;
  }

  setIsUploading(true);
  try {
    const cards = textCards.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const response = await fetch('/api/admin/cards/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Send as JSON
      },
      body: JSON.stringify({
        cardType,
        price: parseFloat(price),
        isImageCard,
        cards,
        uploadMethod: 'text'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    toast.success(result.message);
    
    // Reset form
    setTextCards("");
    setCardType("");
    setPrice("");
    
  } catch (error) {
    toast.error(error.message || "Failed to upload cards");
    console.error(error);
  } finally {
    setIsUploading(false);
  }
};

  const handleFileUpload = async () => {
    if (!cardType || !price || uploadedFiles.length === 0) {
      toast.error("Please fill all required fields and select files");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('cardType', cardType);
      formData.append('price', price);
      formData.append('isImageCard', 'true');
      formData.append('uploadMethod', 'file');

/*       uploadedFiles.forEach((file, index) => {
        // We'd need to get the actual File object here
        // For now, this is a placeholder
      }); */

      const response = await fetch('/api/admin/cards/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success(`Successfully uploaded ${uploadedFiles.length} image cards`);
      setUploadedFiles([]);
      setCardType("");
      setPrice("");
    } catch (error) {
      toast.error("Failed to upload files");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = () => {
    if (uploadMethod === 'text') {
      handleTextUpload();
    } else {
      handleFileUpload();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Scratch Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Card Type and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type *</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {cardTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Image Card Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isImageCard}
              onCheckedChange={setIsImageCard}
            />
            <Label>This is an image card</Label>
          </div>

          {/* Upload Method */}
          <div className="space-y-4">
            <Label>Upload Method</Label>
            <div className="flex gap-4">
              <Button
                variant={uploadMethod === 'text' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('text')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Text Input
              </Button>
              <Button
                variant={uploadMethod === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('file')}
                className="flex-1"
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text*/}
                <Image className="h-4 w-4 mr-2" />
                Image Files
              </Button>
            </div>
          </div>

          {/* Text Input */}
          {uploadMethod === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="textCards">
                Card Pins/Tokens (one per line) *
              </Label>
              <Textarea
                id="textCards"
                placeholder="Enter card pins or tokens, one per line...
WAEC-1234-5678-9012
WAEC-2345-6789-0123
WAEC-3456-7890-1234"
                value={textCards}
                onChange={(e) => setTextCards(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {textCards.split('\n').filter(line => line.trim().length > 0).length} cards
                </span>
                <span>One card per line</span>
              </div>
            </div>
          )}

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop image files here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, GIF. Max 10MB per file.
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !cardType || !price || 
              (uploadMethod === 'text' && !textCards.trim()) ||
              (uploadMethod === 'file' && uploadedFiles.length === 0)}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Cards
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Upload Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-1">1</Badge>
            <div>
              <strong>Text Format:</strong> One card pin/token per line. Ensure no empty lines.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-1">2</Badge>
            <div>
              <strong>Image Files:</strong> Upload clear images of scratch cards. System will process them automatically.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-1">3</Badge>
            <div>
              <strong>Validation:</strong> All cards are checked for duplicates before being added to inventory.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="mt-1">4</Badge>
            <div>
              <strong>Pricing:</strong> Set appropriate prices for each card type. Prices can be updated later.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}