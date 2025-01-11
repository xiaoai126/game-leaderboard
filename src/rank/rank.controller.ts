// src/rank/rank.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { RankService } from './rank.service';
import { UpdateScoreDto } from './dto/update-score.dto';

@Controller('rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Post('update')
  async updateScore(@Body() updateScoreDto: UpdateScoreDto) {
    return this.rankService.updateScore(
      updateScoreDto.userId,
      updateScoreDto.score,
    );
  }

  @Get()
  async getRank(@Query('userId') userId: string) {
    return this.rankService.getRank(userId);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.rankService.getLeaderboard(page, pageSize);
  }
  @Get('around')
  async getAround(
    @Query('userId') userId: string,
    @Query('count') count: number = 5,
  ) {
    return this.rankService.getAround(userId, count);
  }
}
