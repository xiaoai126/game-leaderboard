// src/rank/rank.module.ts
import { Module } from '@nestjs/common';
import { RankService } from './rank.service';
import { RankController } from './rank.controller';
import { RankGateway } from './rank.gateway';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        url: 'redis://localhost:6379', // 你的 Redis 連線 URL
      },
    }),
  ],
  providers: [RankService, RankGateway],
  controllers: [RankController],
})
export class RankModule {}
