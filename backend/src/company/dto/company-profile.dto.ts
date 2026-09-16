import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class UpdateCompanyProfileDto {
  @ApiPropertyOptional({ example: "TechM4India" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) displayName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) tradeName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) cin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) dpiitNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) pan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) tan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) registeredAddressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) registeredAddressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) registeredCity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) registeredState?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) registeredPostalCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) registeredCountry?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  website?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) officialEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) officialPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) mission?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) vision?: string;
  @ApiPropertyOptional({
    description: "Plain text values summary; rich content is intentionally out of scope.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  companyValues?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  logoUrl?: string;
}
