// src/rank/rank.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Server } from 'socket.io';

@Injectable()
export class RankService {
  private readonly logger = new Logger(RankService.name);
  // @ts-expect-error redisClient
  private redisClient = this.redisService.getClient();
  private io: Server;
  private readonly leaderboardKey = 'leaderboard'; // 將 Key 定義為常數

  constructor(private readonly redisService: RedisService) {}

  setIo(io: Server) {
    this.io = io;
  }

  async updateScore(userId: string, score: number) {
    try {
      const prevRank = await this.getRank(userId); // 取得更新前的排名
      const prevScore = await this.redisClient.zscore(
        this.leaderboardKey,
        userId,
      );
      await this.redisClient.zadd(this.leaderboardKey, score, userId);
      const currentRank = await this.getRank(userId); // 取得更新後的排名

      this.io.emit('rankUpdate', {
        userId,
        rank: currentRank,
        score,
        prevScore,
      });

      if (prevRank === null && currentRank !== null) {
        // 上榜通知
        this.io.emit('newEntry', { userId, rank: currentRank, score });
      } else if (
        prevRank !== null &&
        currentRank !== null &&
        currentRank < prevRank
      ) {
        // 超越通知 (排名變小表示排名上升)
        const surpassedUsers = await this.getSurpassedUsers(
          userId,
          prevRank,
          currentRank,
        );
        this.io.emit('rankOverTake', {
          userId,
          rank: currentRank,
          score,
          surpassedUsers,
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to update score: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async getSurpassedUsers(
    userId: string,
    prevRank: number,
    currentRank: number,
  ): Promise<string[]> {
    const surpassedUsers: string[] = [];
    if (prevRank === null) return surpassedUsers;
    const start = currentRank;
    const end = prevRank - 1;

    if (start > end) return surpassedUsers;
    const range = await this.redisClient.zrevrange(
      this.leaderboardKey,
      start,
      end,
    );
    surpassedUsers.push(...range);

    return surpassedUsers;
  }

  async getRank(userId: string): Promise<number | null> {
    try {
      const rank = await this.redisClient.zrevrank(this.leaderboardKey, userId);
      return rank !== null ? rank : null;
    } catch (error) {
      this.logger.error(`Failed to get rank: ${error.message}`, error.stack);
      return null;
    }
  }

  async getLeaderboard(page: number, pageSize: number): Promise<any[]> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    return this.redisClient.zrevrange(
      this.leaderboardKey,
      start,
      end,
      'WITHSCORES',
    );
  }

  async getAround(userId: string, count: number): Promise<any[]> {
    const rank = await this.getRank(userId);
    if (rank === null) return [];
    const start = Math.max(0, rank - count);
    const end = rank + count;
    return this.redisClient.zrevrange(
      this.leaderboardKey,
      start,
      end,
      'WITHSCORES',
    );
  }
}
