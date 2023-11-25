import { Request, Response } from 'express';
import LingoService from '../services/lingo.service';


const lingoService = new LingoService();

class LingoController {

    public async convertUserInputToSQL(req: Request, res: Response) {
        try {
            const userInput = req.body;
            const response = await lingoService.convertUserInputToSQL(userInput);
            return res.status(200).json(response);
        } catch(err:any) {
            console.error('Input_To_SQL error:', err);
            throw err;
        }
    }

    public async askYourDB(req: Request, res: Response){
        try {
            const response = await lingoService.askYourDB(req.body);
            return res.status(200).json(response);
        } catch(err:any) {
            console.error('Ask Your DB error:', err);
            throw new Error(err);
        }
    }

}

export default LingoController;