import express from 'express';

const router = express.Router();

router.get('/signup',(_, res)=>{
    res.send("Signup endpoint");
});

router.get('/login',(_, res)=>{
    res.send("Login endpoint");
});

router.get('/logout',(_, res)=>{
    res.send("Logout endpoint");
});

export default router;