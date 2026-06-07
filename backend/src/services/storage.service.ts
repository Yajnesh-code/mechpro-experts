import { env } from "../config/env.js";

export const storageService = {
  provider: env.storageProvider,

  publicPath(fileName: string) {
    return `/${env.uploadDir}/${fileName}`;
  },

  describe() {
    return {
      provider: env.storageProvider,
      uploadDir: env.uploadDir,
      migrationReady: ["cloudinary", "s3"].includes(env.storageProvider.toLowerCase()),
    };
  },
};
