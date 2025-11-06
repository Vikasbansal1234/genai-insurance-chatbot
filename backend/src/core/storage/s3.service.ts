import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload a file to S3
   * @param filePath - Local file path to upload
   * @param userId - User ID for organizing files
   * @param originalFileName - Original file name
   * @returns S3 key and URL
   */
  async uploadFile(
    filePath: string,
    userId: string,
    originalFileName: string,
  ): Promise<{ key: string; url: string }> {
    // Skip S3 upload if credentials are not configured
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error('S3 credentials not configured. Skipping S3 upload.');
    }

    try {
      // Read file from local filesystem
      const fileContent = fs.readFileSync(filePath);

      // Generate S3 key: userId/timestamp-originalfilename.pdf
      const timestamp = Date.now();
      const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `pdfs/${userId}/${timestamp}-${sanitizedFileName}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/pdf',
        Metadata: {
          userId: userId,
          originalFileName: originalFileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // Generate S3 URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return { key, url };
    } catch (error) {
      console.error('❌ Error uploading file to S3:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to upload file to S3.',
        error: error.message,
      });
    }
  }

  /**
   * Get S3 URL for a given key
   * @param key - S3 object key
   * @returns S3 URL
   */
  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
