import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty({
    description: 'New title for the chat conversation',
    example: 'Health Insurance Questions',
  })
  @IsString()
  title: string;
}
