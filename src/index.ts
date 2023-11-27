import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import LingoRoute from './routes/lingo.route';

dotenv.config();

const app: Express = express();

// Middleware
app.use(
    cors({
      origin: 'https://lingoql.onrender.com',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/api/lingo', LingoRoute);

// Default Route
app.get('/', (_req: Request, res: Response) => {
    res.status(200);
    return res.json({ message: "LingoQL Backend Service"});
});
  
app.get('/api/health', (_req: Request, res: Response) => {
res.status(200);
return res.json({ message: "Okay"});
});
  
app.get('*', (_req: Request, res: Response) => {
res.status(404);
return res.json({ message: "Route not found"});
});



export default app;