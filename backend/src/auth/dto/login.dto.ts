import { Transform } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "employee@techm4india.com" })
  @IsEmail()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @ApiProperty({ example: "development-password" })
  @IsString()
  @Length(12, 128)
  password!: string;
}
