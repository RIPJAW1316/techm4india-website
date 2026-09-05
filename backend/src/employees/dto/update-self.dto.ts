import { IsOptional, IsString, IsUrl, Length } from "class-validator";

export class UpdateSelfDto {
  @IsOptional()
  @IsString()
  @Length(7, 32)
  phone?: string;

  @IsOptional()
  @IsUrl({ protocols: ["http", "https"], require_protocol: true })
  @Length(1, 500)
  profilePhotoUrl?: string;
}
