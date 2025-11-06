import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { AgentModule } from '../agent/agent.module';
import { StorageModule } from '../../core/storage/storage.module';

@Module({
  imports: [AgentModule, StorageModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
