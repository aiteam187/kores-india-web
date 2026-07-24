/**
 * File validation utilities
 */

// Constants
export const ALLOWED_FILE_TYPES = ["application/pdf"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = [".pdf"];

export interface FileValidationResult {
  success: boolean;
  error: string | null;
}

/**
 * Validate file type
 */
export const isValidFileType = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Validate file extension
 */
export const isValidFileExtension = (filename: string): boolean => {
  const extension = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(extension);
};

/**
 * Validate file completely
 */
export const validateFile = (file: File | null | undefined): FileValidationResult => {
  if (!file) {
    return { success: false, error: "No file selected" };
  }

  if (!isValidFileType(file)) {
    return { success: false, error: "Please upload a PDF file only" };
  }

  if (!isValidFileExtension(file.name)) {
    return { success: false, error: "File must have .pdf extension" };
  }

  if (!isValidFileSize(file)) {
    return {
      success: false,
      error: `File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { success: true, error: null };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
