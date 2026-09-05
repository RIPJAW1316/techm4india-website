import { IsUUID } from "class-validator";

export class AddProjectMemberDto {
  @IsUUID() employeeId!: string;
}
