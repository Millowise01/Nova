import "reflect-metadata";
import { writeFileSync } from "node:fs";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { MoneySerializationInterceptor } from "./common/interceptors/money-serialization.interceptor";
import { AppConfigService } from "./config/config.service";

export function buildOpenApiDocument(app: Awaited<ReturnType<typeof NestFactory.create>>) {
  const config = new DocumentBuilder()
    .setTitle("Nova API")
    .setDescription(
      "Phase 1 slice — Identity, Catalog, Cart & Checkout, Orders. See backend/docs/02-api-standards.md.",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("catalog")
    .addTag("cart-checkout")
    .addTag("orders")
    .build();
  return SwaggerModule.createDocument(app, config);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("v1");
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new MoneySerializationInterceptor());

  const config = app.get(AppConfigService);
  app.enableCors({
    origin: config
      .get("CORS_ALLOWED_ORIGINS")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  });

  const document = buildOpenApiDocument(app);
  SwaggerModule.setup("docs", app, document);
  writeFileSync("./openapi.json", JSON.stringify(document, null, 2));

  const port = config.get("PORT");
  await app.listen(port);

  console.log(`Nova backend listening on http://localhost:${port}/v1`);
}

void bootstrap();
