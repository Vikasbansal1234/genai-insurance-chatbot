import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new chat',
    description: 'Creates a new chat conversation for the authenticated user',
  })
  @ApiResponse({ status: 201, description: 'Chat created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createChat(@CurrentUser() user: any, @Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(user.id, createChatDto.title);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all user chats',
    description: 'Retrieves all chat conversations for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'List of chats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserChats(@CurrentUser() user: any) {
    return this.chatService.getUserChats(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get chat by ID',
    description: 'Retrieves a specific chat conversation with all messages',
  })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Chat retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getChatById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatService.getChatById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update chat title',
    description: 'Updates the title of a chat conversation',
  })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Chat title updated successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  updateChatTitle(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.updateChatTitle(id, user.id, updateChatDto.title);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete chat',
    description: 'Deletes a chat conversation and all its messages',
  })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async deleteChat(@CurrentUser() user: any, @Param('id') id: string) {
    await this.chatService.deleteChat(id, user.id);
    return { message: 'Chat deleted successfully' };
  }
}
