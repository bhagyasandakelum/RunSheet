import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

try {
  process.loadEnvFile();
} catch {
  // .env already loaded
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allowed CORS Origins
  const allowedOrigins = [
    'https://run-sheet-eight.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : []),
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((url) => url.trim()) : []),
  ];

  // Enable CORS for frontend integration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptor for uniform response formatting
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Exception Filter for uniform error handling
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`Backend server successfully listening on http://localhost:${port}`);
}
bootstrap();
