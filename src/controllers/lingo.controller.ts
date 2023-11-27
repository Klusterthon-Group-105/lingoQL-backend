import { Request, Response } from 'express';
import LingoService from '../services/lingo.service';
import { logger } from '../utils';
import CustomErrorHandler from '../utils/custom-error-handler';

const lingoService: LingoService = new LingoService();
const customErrorHandler: CustomErrorHandler = new CustomErrorHandler();

class LingoController {
  public async askYourDB(req: Request, res: Response) {
    try {
      const response = await lingoService.askYourDB(req.body);
      return res.status(200).json(response);
    } catch (err: any) {
      logger.error(`Ask Your DB error:, ${err}`);
      return await customErrorHandler.handleCustomError(err, res);
    }
  }
}

export default LingoController;
