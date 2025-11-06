import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('pdf')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  /**
   * POST /api/pdf/upload
   * Upload a PDF, extract text, split into chunks, embed, and store in MongoDB vector store.
   * ✅ Now stores userId in metadata for user-specific retrieval
   */
  @Post('upload')
  @ApiOperation({
    summary: 'Upload PDF document',
    description:
      'Upload a PDF file for processing. The file will be parsed, split into chunks, embedded using OpenAI, and stored in MongoDB Atlas vector store with user-specific metadata. Only the authenticated user can later retrieve content from this document.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload (max size depends on server configuration)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'PDF processed successfully. Returns number of chunks stored and collection details.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format (only PDF allowed) or file not provided',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error during PDF processing' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // local storage path
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(
            new HttpException('Only PDF files are allowed!', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadPdf(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    const result = await this.pdfService.processAndEmbedPdf(file.path, user.id, file.originalname);
    return {
      success: true,
      message: 'PDF processed and embeddings stored successfully!',
      data: result,
    };
  }
}
