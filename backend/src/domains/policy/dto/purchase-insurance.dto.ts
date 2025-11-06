import { IsString, IsDate, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class InsuredDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the insured person' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'self',
    description: 'Relationship to customer (e.g., self, spouse, child, parent)',
  })
  @IsString()
  relation: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date of birth (ISO format: YYYY-MM-DD)' })
  @IsDate()
  @Type(() => Date)
  dob: Date;
}

class BeneficiaryDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Beneficiary full name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'spouse',
    description: 'Relationship to insured (e.g., spouse, child, parent)',
  })
  @IsString()
  relation: string;
}

export class PurchaseInsuranceDto {
  @ApiProperty({
    example: 'Basic Health Insurance',
    description: 'Plan name (get from /api/plans endpoint)',
    required: true,
  })
  @IsString()
  planName: string;

  @ApiProperty({
    example: '65f9876543210fedcba09876',
    description: 'Agent MongoDB ObjectId (optional - from seed data)',
    required: false,
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiProperty({
    type: InsuredDto,
    description: 'Details of the person being insured',
    required: true,
  })
  @ValidateNested()
  @Type(() => InsuredDto)
  insured: InsuredDto;

  @ApiProperty({
    type: [BeneficiaryDto],
    description: 'List of beneficiaries (optional)',
    required: false,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeneficiaryDto)
  @IsOptional()
  beneficiaries?: BeneficiaryDto[];

  @ApiProperty({
    example: '+1-555-123-4567',
    description: 'Customer phone number',
    required: true,
  })
  @IsString()
  customerPhone: string;

  // These fields are now optional and will be auto-filled from authenticated user if not provided
  @ApiProperty({
    example: 'John Doe',
    description:
      "Customer full name (optional - will use authenticated user's username if not provided)",
    required: false,
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description:
      "Customer email address (optional - will use authenticated user's email if not provided)",
    required: false,
  })
  @IsString()
  @IsOptional()
  customerEmail?: string;
}
