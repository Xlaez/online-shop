import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

var prefix = Math.floor(Math.random() * 90).toFixed(4);

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

class MulterOptions {
  constructor() {}

  fileStorage = multer.diskStorage({
    destination: (
      request: Request,
      file: Express.Multer.File,
      callback: DestinationCallback
    ): void => {
      // setting destination
      const dir = "./assets/images";
      callback(null, dir);
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      callback: FileNameCallback
    ): void => {
      // .Naming of file
      callback(null, `pics-${prefix}-${file.originalname}`);
    },
  });

  fileFilter = (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ): void => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  };
}

const multerOptions = new MulterOptions();

export default multerOptions;

// { [fieldname: string]: Express.Multer.File[] }
