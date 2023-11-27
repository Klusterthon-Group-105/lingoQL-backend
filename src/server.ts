import app from './index';
import { logger } from './utils';

const PORT = process.env.PORT || 4040;

app.listen(PORT, ():void => {
    logger.info(`Local server running on: http://localhost:${PORT}`);
});