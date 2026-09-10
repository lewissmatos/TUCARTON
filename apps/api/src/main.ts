import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    origin: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('TuCarton API').setVersion('0.1.0').build(),
  );
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
