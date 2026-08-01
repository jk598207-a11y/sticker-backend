import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Sticker API is running at http://localhost:${port}`);
}
bootstrap();
