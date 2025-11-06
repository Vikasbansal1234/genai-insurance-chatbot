import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { PolicyModule } from './domains/policy/policy.module';
import { AuthModule } from './domains/auth/auth.module';
import { AgentModule } from './domains/agent/agent.module';
import { PdfModule } from './domains/pdf/pdf.module';
import { PlanModule } from './domains/plan/plan.module';
import { ChatModule } from './domains/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    PolicyModule,
    PlanModule,
    AgentModule,
    PdfModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
