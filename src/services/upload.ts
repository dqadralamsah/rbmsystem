const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export interface ProcessedUpload {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

function getFileExtension(fileName: string): string {
  const extensionStart = fileName.lastIndexOf(".");

  if (extensionStart < 0) {
    return "";
  }

  return fileName.slice(extensionStart).toLowerCase();
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getMockStoragePeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}${month}`;
}

export async function validateAndProcessUpload(
  files: File[],
): Promise<ProcessedUpload[]> {
  const storagePeriod = getMockStoragePeriod(new Date());

  return files.map((file, index) => {
    const extension = getFileExtension(file.name);
    const expectedMimeType = ALLOWED_FILE_TYPES[extension];

    if (!expectedMimeType || file.type !== expectedMimeType) {
      throw new Error(
        `Unsupported file type for ${file.name}. Upload PDF, JPG, JPEG, or PNG files only.`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File ${file.name} exceeds the 10MB upload limit.`);
    }

    const safeFileName =
      sanitizeFileName(file.name) || `reimbursement-file-${index + 1}${extension}`;

    // Returning a MinIO-shaped path lets forms and tables use the final database contract before object storage is connected.
    return {
      fileName: safeFileName,
      filePath: `/mock-minio-bucket/reimbursement/${storagePeriod}/${safeFileName}`,
      fileSize: file.size,
      mimeType: file.type,
    };
  });
}
