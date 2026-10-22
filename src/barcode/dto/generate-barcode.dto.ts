import {IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, Matches, ValidateIf} from 'class-validator';

export class GenerateBarcodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @ValidateIf((object)=> object.format === 'ean13')
  @Matches(/^\d{12,13}$/, {
    message: 'EAN-13 text must contain exactly 12 or 13 digits.',
  })
  text: string;

  @IsOptional()
  @IsIn(['code128', 'ean13'])
  format?:string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  scale?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(200)
  height?: number;
}