import express from 'express';

const router = express.Router();

router.get('/send',(_, res)=>{
    res.send('Send messages endpoint');
});

export default router;