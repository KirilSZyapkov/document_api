import { IsNotEmpty,IsString, MaxLength } from "class-validator";

export class GeneratePdfDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100000)
  html: string
}