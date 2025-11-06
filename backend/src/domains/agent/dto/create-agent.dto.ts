import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ConversationMessage {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty({ example: 'What insurance plans do you offer?' })
  @IsString()
  content: string;
}

export class CreateAgentDto {
  @ApiProperty({
    example: 'I want to purchase health insurance for myself',
    description:
      'User message/question for the AI agent. Can be about insurance policies, document queries, or general questions.',
    required: true,
  })
  @IsString()
  input: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description:
      'Optional chat ID to continue an existing conversation. If not provided, a new chat will be created.',
    required: false,
  })
  @IsString()
  @IsOptional()
  chatId?: string;

  @ApiProperty({
    type: [ConversationMessage],
    description: 'Previous messages in the conversation for context',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  @IsOptional()
  conversationHistory?: ConversationMessage[];
}
