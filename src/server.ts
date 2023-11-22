import app from './index';

const PORT = process.env.PORT || 4040;


app.listen(PORT, ():void => {
    console.info(`Local server running on: http://localhost:${PORT}`);
});