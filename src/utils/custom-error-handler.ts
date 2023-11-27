import { Response } from 'express';
import {
  Httpcode,
  BadRequestException,
  InternalServerException,
  ConflictingException,
} from './error-handler';
import { logger } from './logger';

class CustomErrorHandler {
  public async handleCustomError(err: any, res: Response) {
    if (err instanceof BadRequestException) {
      return res.status(err.statusCode).json({
        StatusCode: err.statusCode,
        Message: err.message,
      });
    }
    if (err instanceof InternalServerException) {
      return res.status(Httpcode.INTERNAL_SERVER_ERROR).json({
        StatusCode: err.statusCode,
        Message: err.message,
      });
    }
    if (err instanceof ConflictingException) {
      return res.status(Httpcode.CONFLICTING_ERROR).json({
        StatusCode: err.statusCode,
        Message: err.message,
      });
    }
    logger.error(err);
    return res.status(Httpcode.INTERNAL_SERVER_ERROR).json({
      StatusCode: Httpcode.INTERNAL_SERVER_ERROR,
      Message: 'An error occurred while processing your request. Please try again later.',
    });
  }
}

export default CustomErrorHandler;
