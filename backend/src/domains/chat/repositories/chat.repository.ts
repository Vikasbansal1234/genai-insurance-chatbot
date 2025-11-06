import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument, Message } from '../models/chat.entity';

@Injectable()
export class ChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async create(userId: string, title: string): Promise<ChatDocument> {
    const chat = new this.chatModel({
      userId: new Types.ObjectId(userId),
      title,
      messages: [],
      lastMessageAt: new Date(),
    });
    return chat.save();
  }

  async findAllByUserId(userId: string): Promise<ChatDocument[]> {
    return this.chatModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async findById(chatId: string): Promise<ChatDocument | null> {
    return this.chatModel.findById(chatId).exec();
  }

  async addMessage(
    chatId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<ChatDocument | null> {
    const message: Message = {
      role,
      content,
      timestamp: new Date(),
    };

    return this.chatModel
      .findByIdAndUpdate(
        chatId,
        {
          $push: { messages: message },
          $set: { lastMessageAt: new Date() },
        },
        { new: true },
      )
      .exec();
  }

  async updateTitle(chatId: string, title: string): Promise<ChatDocument | null> {
    return this.chatModel.findByIdAndUpdate(chatId, { title }, { new: true }).exec();
  }

  async deleteById(chatId: string): Promise<boolean> {
    const result = await this.chatModel.deleteOne({ _id: chatId }).exec();
    return result.deletedCount > 0;
  }

  async findByIdAndUserId(chatId: string, userId: string): Promise<ChatDocument | null> {
    return this.chatModel
      .findOne({
        _id: chatId,
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }
}
