import { Request, Response } from 'express';
import ConvoService from "../services/convo.service";
const convoService = new ConvoService();

class ConvoController {

    public async convertUserInputToSQL(req: Request, res: Response) {
        try {
            const userInput = req.body;
            const response = await convoService.convertUserInputToSQL(userInput);
            return res.status(200).json(response);
        } catch(err:any) {
            console.error('Input_To_SQL error:', err);
            throw err;
        }
    }

}

export default ConvoController;