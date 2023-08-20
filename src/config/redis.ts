import Redis from "ioredis";

// Initialize client.
export const redis = new Redis();
console.log("Connected to Redis");
