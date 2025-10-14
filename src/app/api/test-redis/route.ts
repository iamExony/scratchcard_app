import { NextResponse } from "next/server";
import { Redis } from "ioredis";

export async function GET() {
  let redis: Redis | null = null;
  
  try {
    // Create Redis client
    redis = new Redis(process.env.REDIS_URL!);
    
    // Test connection
    await redis.ping();
    
    // Test storing and retrieving data
    const testKey = `test:${Date.now()}`;
    const testData = { 
      message: "Hello Redis!", 
      timestamp: new Date().toISOString(),
      userId: "test-user-123"
    };
    
    // Store data
    await redis.setex(testKey, 60, JSON.stringify(testData)); // Expire in 60 seconds
    
    // Retrieve data
    const storedData = await redis.get(testKey);
    const parsedData = storedData ? JSON.parse(storedData) : null;
    
    // Test complete
    await redis.quit();
    
    return NextResponse.json({
      success: true,
      message: "Redis connection successful!",
      connection: "Connected to Redis Cloud",
      stored: testData,
      retrieved: parsedData,
      match: JSON.stringify(testData) === JSON.stringify(parsedData)
    });
    
  } catch (error: any) {
    console.error("Redis test error:", error);
    
    if (redis) {
      await redis.quit();
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      redisUrl: process.env.REDIS_URL ? "REDIS_URL is set" : "REDIS_URL is missing"
    }, { status: 500 });
  }
}