import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Server } from 'socket.io';

@Injectable()
export class RankService {
  private readonly logger = new Logger(RankService.name);
  // @ts-expect-error: redis type error
  private redisClient = this.redisService.getClient();
  private io: Server;

  constructor(private readonly redisService: RedisService) {}

  setIo(io: Server) {
    this.io = io;
  }

  async updateScore(userId: string, score: number) {
    try {
      await this.redisClient.zadd('leaderboard', score, userId);

      const rank = await this.redisClient.zrevrank('leaderboard', userId);
      const prevScore = await this.redisClient.zscore('leaderboard', userId);
      this.io.emit('rankUpdate', { userId, rank, score, prevScore });
    } catch (error) {
      this.logger.error(
        `Failed to update score: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getRank(userId: string): Promise<number | null> {
    try {
      const rank = await this.redisClient.zrevrank('leaderboard', userId);
      return rank;
    } catch (error) {
      this.logger.error(`Failed to get rank: ${error.message}`, error.stack);
      return null;
    }
  }

  async getLeaderboard(page: number, pageSize: number): Promise<any[]> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    return this.redisClient.zrevrange('leaderboard', start, end, 'WITHSCORES');
  }

  async getAround(userId: string, count: number): Promise<any[]> {
    const rank = await this.getRank(userId);
    if (rank === null) return [];
    const start = Math.max(0, rank - count);
    const end = rank + count;
    return this.redisClient.zrevrange('leaderboard', start, end, 'WITHSCORES');
  }
}
