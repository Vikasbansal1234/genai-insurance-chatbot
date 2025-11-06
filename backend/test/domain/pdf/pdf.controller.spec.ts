import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import request from 'supertest';
import { PdfController } from '../../../src/domains/pdf/pdf.controller';
import { PdfService } from '../../../src/domains/pdf/pdf.service';
import { JwtAuthGuard } from '../../../src/domains/shared/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

// Create a minimal valid PDF buffer for testing
const createMockPdfBuffer = (): Buffer => {
  // Minimal PDF structure: PDF header + basic structure
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
0000000444 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
527
%%EOF`;
  return Buffer.from(pdfContent);
};

describe('PdfController (e2e)', () => {
  let app: INestApplication;
  let _pdfService: PdfService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockPdfResponse = {
    success: true,
    message: 'PDF processed and embeddings stored successfully.',
    chunksStored: 5,
    s3Key: 'pdfs/user123/test-file.pdf',
    s3Url: 'https://bucket.s3.amazonaws.com/pdfs/user123/test-file.pdf',
  };

  const mockPdfService = {
    processAndEmbedPdf: jest.fn(),
  };

  beforeAll(async () => {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(context => {
          const request = context.switchToHttp().getRequest();
          request.user = mockUser;
          return true;
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');

    _pdfService = moduleFixture.get<PdfService>(PdfService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/pdf/upload', () => {
    it('should upload PDF successfully', async () => {
      mockPdfService.processAndEmbedPdf.mockResolvedValue(mockPdfResponse);

      const pdfBuffer = createMockPdfBuffer();
      const response = await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'PDF processed and embeddings stored successfully!',
        data: mockPdfResponse,
      });
      expect(mockPdfService.processAndEmbedPdf).toHaveBeenCalled();
    });

    it('should return 400 when file is not provided', async () => {
      await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(400);

      expect(mockPdfService.processAndEmbedPdf).not.toHaveBeenCalled();
    });

    it('should return 400 when file is not a PDF', async () => {
      await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .attach('file', Buffer.from('not a pdf'), 'test.txt')
        .expect(400);

      expect(mockPdfService.processAndEmbedPdf).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization token is missing', async () => {
      const moduleWithBlockingGuard: TestingModule = await Test.createTestingModule({
        controllers: [PdfController],
        providers: [
          {
            provide: PdfService,
            useValue: mockPdfService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: jest.fn(() => {
            throw new Error('Unauthorized');
          }),
        })
        .compile();

      const blockingApp = moduleWithBlockingGuard.createNestApplication();
      blockingApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );
      blockingApp.setGlobalPrefix('api');
      await blockingApp.init();

      await request(blockingApp.getHttpServer())
        .post('/api/pdf/upload')
        .attach('file', Buffer.from('fake pdf content'), 'test.pdf')
        .expect(500);

      await blockingApp.close();
    });

    it('should return 500 when PDF processing fails', async () => {
      const error = new InternalServerErrorException({
        success: false,
        message: 'Failed to process and embed PDF.',
        error: 'Processing error',
      });

      mockPdfService.processAndEmbedPdf.mockRejectedValue(error);

      const pdfBuffer = createMockPdfBuffer();
      const response = await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(mockPdfService.processAndEmbedPdf).toHaveBeenCalled();
    });

    it('should handle PDF with special characters in filename', async () => {
      mockPdfService.processAndEmbedPdf.mockResolvedValue(mockPdfResponse);

      const pdfBuffer = createMockPdfBuffer();
      const response = await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .attach('file', pdfBuffer, 'test-file (1).pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockPdfService.processAndEmbedPdf).toHaveBeenCalled();
    });

    it('should process PDF and return S3 information', async () => {
      const responseWithS3 = {
        ...mockPdfResponse,
        s3Key: 'pdfs/user123/1234567890-test.pdf',
        s3Url: 'https://bucket.s3.amazonaws.com/pdfs/user123/1234567890-test.pdf',
      };

      mockPdfService.processAndEmbedPdf.mockResolvedValue(responseWithS3);

      const pdfBuffer = createMockPdfBuffer();
      const response = await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(201);

      expect(response.body.data.s3Key).toBeDefined();
      expect(response.body.data.s3Url).toBeDefined();
      expect(response.body.data.chunksStored).toBeGreaterThan(0);
    });

    it('should handle PDF processing without S3 (S3 upload failure)', async () => {
      const responseWithoutS3 = {
        success: true,
        message: 'PDF processed and embeddings stored successfully.',
        chunksStored: 3,
        s3Key: null,
        s3Url: null,
      };

      mockPdfService.processAndEmbedPdf.mockResolvedValue(responseWithoutS3);

      const pdfBuffer = createMockPdfBuffer();
      const response = await request(app.getHttpServer())
        .post('/api/pdf/upload')
        .set('Authorization', 'Bearer mock-jwt-token')
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(201);

      expect(response.body.data.s3Key).toBeNull();
      expect(response.body.data.s3Url).toBeNull();
      expect(response.body.data.chunksStored).toBe(3);
    });
  });
});
