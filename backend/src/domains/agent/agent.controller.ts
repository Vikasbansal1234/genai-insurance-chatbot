import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@ApiTags('agent')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({
    summary: 'Chat with AI Agent',
    description:
      'Send a message to the AI agent. The agent can purchase/renew/cancel insurance policies, retrieve policy information, and search through your uploaded PDF documents. Uses GPT-4 with LangChain tools including RAG capabilities.',
  })
  @ApiBody({ type: CreateAgentDto })
  @ApiResponse({ status: 200, description: 'Agent response with conversation output' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error during agent processing' })
  create(@CurrentUser() user: any, @Body() createAgentDto: CreateAgentDto) {
    return this.agentService.createConversation(user, createAgentDto);
  }
}
