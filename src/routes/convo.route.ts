import express, { Router } from 'express';
import ConvoController from '../controllers/convo.controller';

const router: Router = express.Router();
const convoController = new ConvoController();

router.post('/grabUserInput', convoController.convertUserInputToSQL);


export default router;