import "dotenv/config";

import { CommandFactory } from "nest-commander";
import { IngestionModule } from "./ingestion/ingestion.module";

async function bootstrap() {
  // CommandFactory.run은 우리가 만들 "CLI 앱"을 실행시켜 줍니다.
  // IngestionModule은 이 앱의 "설계도"입니다. (아직 안 만들어서 빨간 줄이 뜰 거예요)
  await CommandFactory.run(IngestionModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
}
bootstrap();
