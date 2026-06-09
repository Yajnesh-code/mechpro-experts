import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const storageProvider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();

if (!["local", "cloudinary"].includes(storageProvider)) {
  throw new Error("Invalid STORAGE_PROVIDER. Use local or cloudinary.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8000),
  databaseUrl: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/mechpro_experts?schema=public"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  storageProvider,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER ?? "mechpro-experts",
  publicApiUrl: process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 8000}`,
};

if (env.storageProvider.toLowerCase() === "cloudinary") {
  required("CLOUDINARY_CLOUD_NAME");
  required("CLOUDINARY_API_KEY");
  required("CLOUDINARY_API_SECRET");
}
