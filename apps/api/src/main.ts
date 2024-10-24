import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import helmet from '@fastify/helmet';
import { join } from 'path';
import handlebars from 'handlebars';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
const chalk = import('chalk').then((m) => m.default);

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars,
    },
    templates: join(__dirname, '..', 'views'),
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('API example')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('docs', app as any, documentFactory);

  await app.listen(process.env.PORT || 3001);
  chalk.then(async (c) =>
    console.log(c.green(`Application is running on: ${await app.getUrl()}`)),
  );
}
bootstrap();
