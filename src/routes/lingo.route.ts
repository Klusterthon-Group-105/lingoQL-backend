import express, { Router } from 'express';
import LingoController from '../controllers/lingo.controller';
import multer from 'multer';

const router: Router = express.Router();
const lingoController = new LingoController();
const storage: multer.StorageEngine = multer.memoryStorage();
const upload: multer.Multer = multer({ storage: storage }); 

router.post('/query', lingoController.convertUserInputToSQL);
router.post('/query-your-db', lingoController.askYourDB);


export default router;