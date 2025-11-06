import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain';
import { AGENT_MODEL, systemInstruction } from './agent.constants';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class AgentService {
  constructor(
    @Inject(AGENT_MODEL) private readonly createAgentFactory: (userId: string) => Promise<any>,
    private readonly chatService: ChatService,
  ) {}

  async createConversation(user: { id: string }, createAgentDto: CreateAgentDto) {
    try {
      const { input, chatId, conversationHistory } = createAgentDto;

      // Get or create chat
      let chat: any;
      if (chatId) {
        // Load existing chat
        chat = await this.chatService.getChatById(chatId, user.id);
      } else {
        // Create new chat with a title based on first message
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
        chat = await this.chatService.createChat(user.id, title);
      }

      // Save user message to chat history
      await this.chatService.addMessage(chat._id.toString(), user.id, 'user', input);

      // Create agent using factory from provider
      const agent = await this.createAgentFactory(user.id);

      // Build message history for LangChain - ALWAYS start with system instruction
      const messages = this.buildMessagesWithSystemInstruction(input, conversationHistory);
      const result = await agent.invoke(
        {
          messages,
        },
        {
          context: {
            user_id: user.id,
            chat_id: chat._id.toString(),
          },
        },
      );

      const rawOutput = result.messages[result.messages.length - 1].content;
      const output = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput);

      // Save assistant response to chat history
      await this.chatService.addMessage(chat._id.toString(), user.id, 'assistant', output);

      return {
        output,
        chatId: chat._id.toString(),
      };
    } catch (error) {
      console.error('❌ Agent error:', error);
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to create conversation',
        message: error.message,
      });
    }
  }

  /**
   * Build messages array ensuring system instruction is ALWAYS first
   * This ensures the tool-only requirement persists across all conversation turns
   */
  private buildMessagesWithSystemInstruction(
    currentInput: string,
    conversationHistory?: Array<{ role: string; content: string }>,
  ): Array<SystemMessage | HumanMessage | AIMessage> {
    const messages: Array<SystemMessage | HumanMessage | AIMessage> = [];

    // CRITICAL: System instruction MUST be first - this enforces tool-only responses
    messages.push(new SystemMessage(systemInstruction));

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
        // Skip any system messages from history - we control the system message
      }
    } else {
      console.log('⚠️ No conversation history provided!');
    }

    // Add current user message
    messages.push(new HumanMessage(currentInput));

    return messages;
  }
}
