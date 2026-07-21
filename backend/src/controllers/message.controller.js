import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : { $ne:loggedInUserId}}).select('-password');

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log('Error in Get All Contacts', error);
        res.status(500).json({message : 'Server Error'});
    }
};


export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const {id : userToChatId} = req.params;

        const messages = await Message.find({
            $or : [
                {senderId : myId, receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        });

        res.status(200).json(messages)
    } catch (error) {
        console.log('Error in Get Messages By USer id', error);
        res.status(500).json({message : 'Server Error'});
    }
};


export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        if(!text && !image) return res.status(400).json({message : "Text or Image is required"});

        if(senderId.equals(receiverId)) if(!text && !image) return res.status(400).json({message : "Cannot send message to yourself"});

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl
        });

        await newMessage.save();

        res.status(201).json(newMessage);

    } catch (error) {
        console.log('Error in Send Message', error);
        res.status(500).json({message : 'Server Error'});
    }
};


export const getChatParteners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const messages = await Message.find({
            $or : [
                {senderId : loggedInUserId}, {receiverId : loggedInUserId}
            ]
        });

        const chatPartenerIds =[... new Set(messages.map(msg => 
            msg.senderId.toString() === loggedInUserId.toString() 
                ? msg.receiverId.toString() 
                : msg.senderId.toString())
        )];
        
        const chatParteners = await User.find({_id : {$in:chatPartenerIds}}).select('-password');

        res.status(200).json(chatParteners);

    } catch (error) {
        console.log('Error in Getting Chat Parteners', error);
        res.status(500).json({message : 'Server Error'});
    }
};