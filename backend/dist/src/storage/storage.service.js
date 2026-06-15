"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const minio_1 = require("minio");
const fs = require("fs");
let StorageService = StorageService_1 = class StorageService {
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    minioClient;
    constructor(configService) {
        this.configService = configService;
        this.initializeMinioClient();
    }
    initializeMinioClient() {
        this.minioClient = new minio_1.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
            port: this.configService.get('MINIO_PORT', 9000),
            useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
            accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
        });
    }
    async uploadFile(bucketName, fileName, filePath, contentType = 'application/octet-stream') {
        try {
            const objectName = `${Date.now()}-${fileName}`;
            const fileStream = fs.createReadStream(filePath);
            const fileStats = fs.statSync(filePath);
            await this.minioClient.putObject(bucketName, objectName, fileStream, fileStats.size, { 'Content-Type': contentType });
            this.logger.log(`File uploaded successfully: ${bucketName}/${objectName}`);
            return `${bucketName}/${objectName}`;
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error}`);
            throw error;
        }
    }
    async uploadBuffer(bucketName, fileName, buffer, contentType = 'application/octet-stream') {
        try {
            const objectName = `${Date.now()}-${fileName}`;
            await this.minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
                'Content-Type': contentType,
            });
            this.logger.log(`File uploaded successfully: ${bucketName}/${objectName}`);
            return `${bucketName}/${objectName}`;
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error}`);
            throw error;
        }
    }
    async downloadFile(bucketName, objectName) {
        try {
            const chunks = [];
            const dataStream = await this.minioClient.getObject(bucketName, objectName);
            return new Promise((resolve, reject) => {
                dataStream.on('data', (chunk) => chunks.push(chunk));
                dataStream.on('end', () => resolve(Buffer.concat(chunks)));
                dataStream.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`Failed to download file: ${error}`);
            throw error;
        }
    }
    async deleteFile(bucketName, objectName) {
        try {
            await this.minioClient.removeObject(bucketName, objectName);
            this.logger.log(`File deleted successfully: ${bucketName}/${objectName}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error}`);
            throw error;
        }
    }
    async ensureBucketExists(bucketName) {
        try {
            const exists = await this.minioClient.bucketExists(bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(bucketName);
                this.logger.log(`Bucket created: ${bucketName}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to ensure bucket: ${error}`);
            throw error;
        }
    }
    getFileUrl(bucketName, objectName) {
        const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
        const port = this.configService.get('MINIO_PORT', 9000);
        const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
        const protocol = useSSL ? 'https' : 'http';
        return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map