import { IsNotEmpty, IsString, MaxLength, IsInt, IsOptional, Max,Min } from "class-validator";

export class GenerateQrDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  data: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(2000)
  width?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  margin?: number
}