import express from 'express';
import { signup } from '../controllers/auth.contoller.js';

const router = express.Router();

router.post('/signup',signup);

router.get('/login',(_, res)=>{
    res.send("Login endpoint");
});

router.get('/logout',(_, res)=>{
    res.send("Logout endpoint");
});

export default router;