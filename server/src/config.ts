import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'cpted',
    password: process.env.DB_PASSWORD || 'cpted',
    database: process.env.DB_NAME || 'cpted',
  },
  photoDir: process.env.PHOTO_DIR || '/data/photos',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
} as const;
