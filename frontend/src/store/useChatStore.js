import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { UseAuthStore } from "./useAuthstore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => set({selectedUser}),

    getAllContacts: async ()=>{
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({allContacts: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUsersLoading: false});
        }
    },


    getMyChatPartners: async ()=>{
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({chats: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUsersLoading: false});
        }
    },

    getMessagesByUserId: async (userId) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        } catch (error) {
            toast.error(error.response?.data?.message || "Something Went Wrong");
        } finally {
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async (msgdata) => {
        const {selectedUser, messages} = get();
        const {authUser} = UseAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
        _id: tempId,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: msgdata.text,
        image: msgdata.image,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        };
        
        set({ messages: [...messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,msgdata);
            set({messages:messages.concat(res.data)});
        } catch (error) {
            set({ messages: messages });
            toast.error(error.response?.data?.message || "Something Went Wrong");
        }
    },

    subscribeToMessages : () => {
        const {selectedUser} = get();
        if(!selectedUser) return ;
        console.log(selectedUser);
        const socket = UseAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            const currentMessages = get().messages;
            set({messages : [...currentMessages, newMessage]});
        });
    },

    unsubscribeFromMessages : () => {
        const socket = UseAuthStore.getState().socket;
        socket.off("newMessage");
    },
    
}));