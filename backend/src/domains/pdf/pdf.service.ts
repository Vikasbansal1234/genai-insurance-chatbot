import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document as LangDoc } from '@langchain/core/documents';
import { VECTOR_STORE } from '../agent/agent.constants';
import { S3Service } from '../../core/storage/s3.service';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  constructor(
    @Inject(VECTOR_STORE) private readonly vectorStore: any,
    private readonly s3Service: S3Service,
  ) {}
  async processAndEmbedPdf(filePath: string, userId: string, originalFileName: string) {
    let s3Key: string | null = null;
    let s3Url: string | null = null;

    try {
      /** 1️⃣ Upload PDF to S3 */
      try {
        const s3Result = await this.s3Service.uploadFile(filePath, userId, originalFileName);
        s3Key = s3Result.key;
        s3Url = s3Result.url;
        console.log(`✅ PDF uploaded to S3: ${s3Url}`);
      } catch (s3Error) {
        console.error(
          '⚠️ Warning: Failed to upload to S3, continuing with local processing:',
          s3Error,
        );
        // Continue processing even if S3 upload fails
      }

      /** 2️⃣ Load and parse the PDF */
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();

      if (!docs.length) {
        throw new Error('No content extracted from PDF.');
      }

      /** 3️⃣ Split into smaller text chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = (await textSplitter.splitDocuments(docs)).map((doc, idx) => {
        return new LangDoc({
          pageContent: doc.pageContent,
          metadata: {
            userId: userId, // ✅ Store user ID in metadata
            fileName: filePath.split('/').pop(),
            originalFileName: originalFileName,
            chunkIndex: idx,
            ...(s3Key && { s3Key: s3Key }), // Store S3 key in metadata
            ...(s3Url && { s3Url: s3Url }), // Store S3 URL in metadata
          },
        });
      });

      /** 4️⃣ Use vector store from provider to embed the chunks */
      await this.vectorStore.addDocuments(splitDocs);

      /** 5️⃣ Cleanup local temp file */
      fs.unlinkSync(filePath);

      /** ✅ Return success */
      return {
        success: true,
        message: 'PDF processed and embeddings stored successfully.',
        chunksStored: splitDocs.length,
        s3Key: s3Key,
        s3Url: s3Url,
      };
    } catch (error) {
      console.error('❌ Error embedding PDF:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to process and embed PDF.',
        error: error.message,
      });
    }
  }
}
