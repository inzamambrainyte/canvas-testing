import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/canvas_editor_db",

  // Third-party API keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  pexelsApiKey: process.env.PEXELS_API_KEY,
  freesoundApiKey: process.env.FREESOUND_API_KEY,

  // JWT
  jwtSecret: process.env.JWT_SECRET || "change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
};

// Validate required environment variables
const requiredEnvVars = ["OPENAI_API_KEY", "PEXELS_API_KEY"];

if (config.nodeEnv === "production") {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}
