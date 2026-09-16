import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, Length, Matches, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CmsContentStatus, CmsContentType } from "@prisma/client";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CmsPageQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: CmsContentStatus })
  @IsOptional()
  @IsEnum(CmsContentStatus)
  status?: CmsContentStatus;

  @ApiPropertyOptional({ enum: CmsContentType })
  @IsOptional()
  @IsEnum(CmsContentType)
  type?: CmsContentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 160)
  search?: string;
}

export class CreateCmsPageDto {
  @ApiProperty({ example: "robotics-lab-guidelines" })
  @IsString()
  @Matches(SLUG_PATTERN)
  @Length(2, 160)
  slug!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiProperty({ enum: CmsContentType })
  @IsEnum(CmsContentType)
  type!: CmsContentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 500)
  summary?: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50000)
  body!: string;
}

export class AddCmsRevisionDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 500)
  summary?: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50000)
  body!: string;
}
