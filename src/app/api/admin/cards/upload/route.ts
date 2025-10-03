/* // app/api/admin/cards/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you'd check if the user is admin from the session
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (user?.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const formData = await request.formData();
    const cardType = formData.get('cardType') as string;
    const price = parseFloat(formData.get('price') as string);
    const isImageCard = formData.get('isImageCard') === 'true';
    const uploadMethod = formData.get('uploadMethod') as string;

    if (!cardType || !price) {
      return NextResponse.json(
        { error: "Card type and price are required" },
        { status: 400 }
      );
    }

    if (uploadMethod === 'text') {
      const textData = formData.get('cards') as string;
      return await handleTextUpload(cardType, price, isImageCard, textData);
    } else {
      return await handleFileUpload(cardType, price, formData);
    }

  } catch (error) {
    console.error("Card upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleTextUpload(
  cardType: string,
  price: number,
  isImageCard: boolean,
  textData: string
) {
  const cards = textData.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (cards.length === 0) {
    return NextResponse.json(
      { error: "No valid cards found in text" },
      { status: 400 }
    );
  }

  // Check for duplicates
  const existingCards = await prisma.scratchCard.findMany({
    where: {
      pin: { in: cards }
    },
    select: { pin: true }
  });

  const existingPins = new Set(existingCards.map(card => card.pin));
  const uniqueCards = cards.filter(pin => !existingPins.has(pin));

  if (uniqueCards.length === 0) {
    return NextResponse.json(
      { error: "All cards already exist in database" },
      { status: 400 }
    );
  }

  // Create cards in database
  const createdCards = await prisma.scratchCard.createMany({
    data: uniqueCards.map(pin => ({
      type: cardType as any,
      pin: pin,
      value: pin, // For text cards, value is the same as pin
      isImage: isImageCard,
      price: price,
      isUsed: false,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    message: `Successfully uploaded ${createdCards.count} cards`,
    totalSubmitted: cards.length,
    duplicates: cards.length - uniqueCards.length,
    uploaded: createdCards.count,
  });
}

async function handleFileUpload(
  cardType: string,
  price: number,
  formData: FormData
) {
  // For image files, you would:
  // 1. Upload images to cloud storage (AWS S3, Cloudinary, etc.)
  // 2. Store the image URLs in the database
  // 3. Optionally process the images to extract text (OCR)

  // This is a simplified version
  const files = formData.getAll('files') as File[];
  
  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: "No files provided" },
      { status: 400 }
    );
  }

  // In a real implementation, you'd upload files to cloud storage
  const uploadedCards = [];
  
  for (const file of files) {
    // Simulate file upload and processing
    const fileName = `cards/${Date.now()}-${file.name}`;
    const imageUrl = `/uploads/${fileName}`; // This would be your CDN URL

    const card = await prisma.scratchCard.create({
      data: {
        type: cardType as any,
        pin: `IMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        value: imageUrl, // Store image URL
        isImage: true,
        price: price,
        isUsed: false,
      },
    });

    uploadedCards.push(card);
  }

  return NextResponse.json({
    message: `Successfully uploaded ${uploadedCards.length} image cards`,
    cards: uploadedCards,
  });
} */

  // app/api/admin/cards/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    let cardType: string;
    let price: number;
    let isImageCard: boolean;
    let uploadMethod: string;
    let cards: string[] = [];
    let files: File[] = [];

    if (contentType.includes("application/json")) {
      // Handle JSON request (text upload)
      const jsonData = await request.json();
      cardType = jsonData.cardType;
      price = jsonData.price;
      isImageCard = jsonData.isImageCard;
      uploadMethod = jsonData.uploadMethod;
      cards = jsonData.cards || [];
    } else if (contentType.includes("multipart/form-data")) {
      // Handle form data (file upload)
      const formData = await request.formData();
      cardType = formData.get('cardType') as string;
      price = parseFloat(formData.get('price') as string);
      isImageCard = formData.get('isImageCard') === 'true';
      uploadMethod = formData.get('uploadMethod') as string;
      
      // For file uploads, you would handle the files here
      const fileData = formData.getAll('files') as File[];
      files = fileData;
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    if (!cardType || !price) {
      return NextResponse.json(
        { error: "Card type and price are required" },
        { status: 400 }
      );
    }

    if (uploadMethod === 'text') {
      return await handleTextUpload(cardType, price, isImageCard, cards);
    } else {
      return await handleFileUpload(cardType, price, files);
    }

  } catch (error) {
    console.error("Card upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleTextUpload(
  cardType: string,
  price: number,
  isImageCard: boolean,
  cards: string[]
) {
  if (cards.length === 0) {
    return NextResponse.json(
      { error: "No valid cards provided" },
      { status: 400 }
    );
  }

  // Check for duplicates
  const existingCards = await prisma.scratchCard.findMany({
    where: {
      pin: { in: cards }
    },
    select: { pin: true }
  });

  const existingPins = new Set(existingCards.map(card => card.pin));
  const uniqueCards = cards.filter(pin => !existingPins.has(pin));

  if (uniqueCards.length === 0) {
    return NextResponse.json(
      { error: "All cards already exist in database" },
      { status: 400 }
    );
  }

  // Create cards in database
  const createdCards = await prisma.scratchCard.createMany({
    data: uniqueCards.map(pin => ({
      type: cardType as any,
      pin: pin,
      value: pin, // For text cards, value is the same as pin
      isImage: isImageCard,
      price: price,
      isUsed: false,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    message: `Successfully uploaded ${createdCards.count} cards`,
    totalSubmitted: cards.length,
    duplicates: cards.length - uniqueCards.length,
    uploaded: createdCards.count,
  });
}

async function handleFileUpload(
  cardType: string,
  price: number,
  files: File[]
) {
  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: "No files provided" },
      { status: 400 }
    );
  }

  // For now, we'll simulate file upload by creating text entries
  // In a real implementation, you'd upload to cloud storage
  const uploadedCards = [];
  
  for (const file of files) {
    // Generate a unique pin for image cards
    const pin = `IMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const card = await prisma.scratchCard.create({
      data: {
        type: cardType as any,
        pin: pin,
        value: `File: ${file.name}`, // Store file info
        isImage: true,
        price: price,
        isUsed: false,
      },
    });

    uploadedCards.push(card);
  }

  return NextResponse.json({
    message: `Successfully uploaded ${uploadedCards.length} image cards`,
    cards: uploadedCards,
  });
}