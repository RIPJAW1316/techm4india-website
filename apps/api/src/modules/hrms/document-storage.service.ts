import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface PresignedUploadResult {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  headers: Record<string, string>;
  publicDownloadUrl: string;
}

export interface PresignedDownloadResult {
  downloadUrl: string;
  expiresInSeconds: number;
}

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly bucketName: string;
  private readonly storageProvider: string;
  private readonly allowedMimeTypes = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);
  private readonly maxFileSizeBytes = 10 * 1024 * 1024; // 10MB default limit

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('STORAGE_BUCKET', 'techm4india-erp-documents-private');
    this.storageProvider = this.configService.get<string>('STORAGE_PROVIDER', 's3-compatible');
  }

  /**
   * Validates file upload metadata against enterprise security policies
   */
  validateUploadRequest(fileName: string, mimeType: string, fileSize: number): void {
    if (!this.allowedMimeTypes.has(mimeType)) {
      throw new Error(
        `Disallowed file type: ${mimeType}. Allowed formats: PDF, PNG, JPEG, WebP, DOCX.`
      );
    }

    if (fileSize > this.maxFileSizeBytes) {
      throw new Error(
        `File size exceeds maximum permitted threshold of ${this.maxFileSizeBytes / (1024 * 1024)}MB.`
      );
    }

    // Check for dangerous path characters or double extensions (e.g. evil.pdf.exe)
    const sanitizedFileName = fileName.trim().toLowerCase();
    const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.js', '.vbs', '.scr', '.jar', '.php'];
    if (dangerousExtensions.some((ext) => sanitizedFileName.includes(ext))) {
      throw new Error('Executable and script extensions are strictly prohibited.');
    }
  }

  /**
   * Generates a short-lived presigned upload URL and secure storage key
   */
  async generatePresignedUpload(
    organizationId: string,
    category: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<PresignedUploadResult> {
    this.validateUploadRequest(fileName, mimeType, fileSize);

    // Generate collision-resistant cryptographically randomized storage key
    // Pattern: {orgId}/{category}/{YYYYMM}/{uuid}-{safeFileName}
    const safeBaseName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const randomUuid = crypto.randomUUID();
    const datePartition = new Date().toISOString().slice(0, 7); // e.g. 2026-10
    const storageKey = `orgs/${organizationId}/${category}/${datePartition}/${randomUuid}-${safeBaseName}`;

    // Token-bound signature with 15-minute validity (900 seconds)
    const expiresInSeconds = 900;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    const signaturePayload = `${this.bucketName}:${storageKey}:${mimeType}:${expiresAt}`;
    const hmacSecret = this.configService.get<string>('STORAGE_SIGNING_SECRET', 'tm4i-storage-hmac-secret-2026');
    const signature = crypto.createHmac('sha256', hmacSecret).update(signaturePayload).digest('hex');

    const storageEndpoint = this.configService.get<string>(
      'STORAGE_ENDPOINT',
      'https://storage.techm4india.com'
    );

    const uploadUrl = `${storageEndpoint}/${this.bucketName}/${storageKey}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=${signature}`;
    const publicDownloadUrl = `/api/v1/hrms/documents/download?key=${encodeURIComponent(storageKey)}`;

    return {
      uploadUrl,
      storageKey,
      expiresInSeconds,
      headers: {
        'Content-Type': mimeType,
        'x-amz-server-side-encryption': 'AES256',
        'x-amz-meta-organization': organizationId,
      },
      publicDownloadUrl,
    };
  }

  /**
   * Generates a short-lived presigned download URL for private documents
   */
  async generatePresignedDownload(storageKey: string, organizationId?: string): Promise<PresignedDownloadResult> {
    // Prevent path traversal
    if (storageKey.includes('..') || storageKey.startsWith('/')) {
      throw new Error('Invalid storage key specification.');
    }

    if (organizationId && !storageKey.startsWith(`orgs/${organizationId}/`)) {
      throw new Error('Cross-tenant document access denied.');
    }

    const expiresInSeconds = 300; // 5 minutes
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const hmacSecret = this.configService.get<string>('STORAGE_SIGNING_SECRET', 'tm4i-storage-hmac-secret-2026');
    const signature = crypto.createHmac('sha256', hmacSecret).update(`${storageKey}:${expiresAt}`).digest('hex');

    const storageEndpoint = this.configService.get<string>(
      'STORAGE_ENDPOINT',
      'https://storage.techm4india.com'
    );

    const downloadUrl = `${storageEndpoint}/${this.bucketName}/${storageKey}?exp=${expiresAt}&sig=${signature}`;

    return {
      downloadUrl,
      expiresInSeconds,
    };
  }
}
