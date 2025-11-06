import { IsString, IsNumber, IsEnum, IsOptional, Min, MaxLength } from 'class-validator';

export enum PolicyType {
  HEALTH = 'health',
  LIFE = 'life',
  AUTO = 'auto',
  HOME = 'home',
}

export enum PolicyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export class CreatePolicyDto {
  @IsString()
  @MaxLength(50)
  policyNumber: string;

  @IsString()
  @MaxLength(200)
  customerName: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  customerEmail?: string;

  @IsEnum(PolicyType)
  policyType: PolicyType;

  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @IsNumber()
  @Min(0)
  premium: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;
}
