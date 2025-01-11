import { IsNumber, IsString } from 'class-validator';

export class UpdateScoreDto {
  @IsString()
  userId: string;

  @IsNumber()
  score: number;
}
