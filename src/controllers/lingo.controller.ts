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

}

export default LingoController;