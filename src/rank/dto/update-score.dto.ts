// src/rank/dto/update-score.dto.ts
import { IsNumber, IsString } from 'class-validator';

export class UpdateScoreDto {
  @IsString()
  userId: string;

  @IsNumber()
  score: number;
}
