import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.enableCors({
    origin: '*', // Update with your client's URL
    methods: '*',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
