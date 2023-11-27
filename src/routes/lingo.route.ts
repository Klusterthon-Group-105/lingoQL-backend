import express, { Router } from 'express';
import LingoController from '../controllers/lingo.controller';

const router: Router = express.Router();
const lingoController = new LingoController(); 

router.post('/query-your-db', lingoController.askYourDB);

export default router;