import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res)=>{
    const {fullName, email, password} = req.body;

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        if(password.length < 6) {
            return res.status(400).json({message: 'Password must be at least 6 characteres'});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: 'Invalide Email format'});
        }
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message : 'Email Alredy Exist'});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword
        });

        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id : newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
                profilePic : newUser.profilePic,
            });
        } else {
            res.status(400).json({message : 'Invalide user data'});
        }

    } catch (error) {
        console.log("Error in signup controller" + error);
        res.status(500).json({message : 'internal server error'});
    }
};


export const login = async (req, res)=>{
    const {email, password} = req.body;

    try {
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        const user = await User.findOne({email});

        if(!user) return res.status(400).json({message : "Invalide Data"});

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) return res.status(400).json({message : "Invalide Data"});

        generateToken(user._id, res);

        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic
        });

    } catch (error) {
        console.error("Error in login ", error);
        res.status(500).json({message : "Internal Server Error"});
    }
};


export const logout = (_, res)=>{
    res.cookie('jwt', "", {maxAge : 0});
    res.status(200).json({message : "Loged Out Successfully"}); 
};


export const updateProfile = async (req, res)=>{
    try {
        const {profilePic} = req.body;
        if(!profilePic) return res.status(400).json({message: 'New pic is required'});

        const userId = req.user._id;

        const uploadRes = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadRes.secure_url},
             {new : true});

        res.status(200).json(updatedUser);     
    } catch (error) {
        console.log('error in upload Picture',error);
        res.status(500).json({message : "Internal Server Error"});
    }
}