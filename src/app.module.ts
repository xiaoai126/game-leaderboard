import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankModule } from './rank/rank.module';

@Module({
  imports: [RankModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
