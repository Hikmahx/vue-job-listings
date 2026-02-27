declare module 'multer' {
  import { RequestHandler } from 'express';

  interface StorageEngine {
    _handleFile(req: unknown, file: unknown, callback: (error?: Error | null, info?: unknown) => void): void;
    _removeFile(req: unknown, file: unknown, callback: (error: Error | null) => void): void;
  }

  interface Options {
    storage?: StorageEngine;
    limits?: { fileSize?: number };
    fileFilter?(
      req: unknown,
      file: { mimetype: string; fieldname: string; originalname: string; size: number },
      callback: (error: Error | null, acceptFile?: boolean) => void
    ): void;
  }

  interface MulterInstance {
    single(name: string): RequestHandler;
  }

  interface MulterExport {
    (options?: Options): MulterInstance;
    memoryStorage(): StorageEngine;
  }

  const multer: MulterExport;
  export = multer;
}
