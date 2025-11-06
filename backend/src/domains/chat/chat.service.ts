import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { ChatDocument } from './models/chat.entity';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createChat(userId: string, title?: string): Promise<ChatDocument> {
    const chatTitle = title || `Chat ${new Date().toLocaleString()}`;
    return this.chatRepository.create(userId, chatTitle);
  }

  async getUserChats(userId: string): Promise<ChatDocument[]> {
    return this.chatRepository.findAllByUserId(userId);
  }

  async getChatById(chatId: string, userId: string): Promise<ChatDocument> {
    const chat = await this.chatRepository.findByIdAndUserId(chatId, userId);

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    return chat;
  }

  async addMessage(
    chatId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<ChatDocument> {
    // Verify ownership
    const existingChat = await this.chatRepository.findByIdAndUserId(chatId, userId);
    if (!existingChat) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const updatedChat = await this.chatRepository.addMessage(chatId, role, content);

    if (!updatedChat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    return updatedChat;
  }

  async updateChatTitle(chatId: string, userId: string, title: string): Promise<ChatDocument> {
    // Verify ownership
    const existingChat = await this.chatRepository.findByIdAndUserId(chatId, userId);
    if (!existingChat) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const updatedChat = await this.chatRepository.updateTitle(chatId, title);

    if (!updatedChat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    return updatedChat;
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    // Verify ownership
    const existingChat = await this.chatRepository.findByIdAndUserId(chatId, userId);
    if (!existingChat) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const deleted = await this.chatRepository.deleteById(chatId);

    if (!deleted) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }
  }
}
