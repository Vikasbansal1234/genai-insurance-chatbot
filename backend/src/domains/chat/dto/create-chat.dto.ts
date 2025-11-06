import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Title for the chat conversation',
    example: 'Insurance Policy Discussion',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;
}
