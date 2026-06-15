import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private readonly logger;
    private minioClient;
    constructor(configService: ConfigService);
    private initializeMinioClient;
    uploadFile(bucketName: string, fileName: string, filePath: string, contentType?: string): Promise<string>;
    uploadBuffer(bucketName: string, fileName: string, buffer: Buffer, contentType?: string): Promise<string>;
    downloadFile(bucketName: string, objectName: string): Promise<Buffer>;
    deleteFile(bucketName: string, objectName: string): Promise<void>;
    ensureBucketExists(bucketName: string): Promise<void>;
    getFileUrl(bucketName: string, objectName: string): string;
}
