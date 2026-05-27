import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Client;

  constructor(private configService: ConfigService) {
    this.initializeMinioClient();
  }

  private initializeMinioClient(): void {
    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get('MINIO_PORT', 9000),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    filePath: string,
    contentType: string = 'application/octet-stream',
  ): Promise<string> {
    try {
      const objectName = `${Date.now()}-${fileName}`;

      const fileStream = fs.createReadStream(filePath);
      const fileStats = fs.statSync(filePath);

      await this.minioClient.putObject(
        bucketName,
        objectName,
        fileStream,
        fileStats.size,
        { 'Content-Type': contentType },
      );

      this.logger.log(
        `File uploaded successfully: ${bucketName}/${objectName}`,
      );
      return `${bucketName}/${objectName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`);
      throw error;
    }
  }

  async uploadBuffer(
    bucketName: string,
    fileName: string,
    buffer: Buffer,
    contentType: string = 'application/octet-stream',
  ): Promise<string> {
    try {
      const objectName = `${Date.now()}-${fileName}`;

      await this.minioClient.putObject(
        bucketName,
        objectName,
        buffer,
        buffer.length,
        {
          'Content-Type': contentType,
        },
      );

      this.logger.log(
        `File uploaded successfully: ${bucketName}/${objectName}`,
      );
      return `${bucketName}/${objectName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`);
      throw error;
    }
  }

  async downloadFile(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const chunks: Buffer[] = [];
      const dataStream = await this.minioClient.getObject(
        bucketName,
        objectName,
      );

      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to download file: ${error}`);
      throw error;
    }
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, objectName);
      this.logger.log(`File deleted successfully: ${bucketName}/${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`);
      throw error;
    }
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName);
        this.logger.log(`Bucket created: ${bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure bucket: ${error}`);
      throw error;
    }
  }

  getFileUrl(bucketName: string, objectName: string): string {
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get('MINIO_PORT', 9000);
    const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
  }
}
