import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const UseAuthStore = create((set) => ({
    authUser : null,
    ischeckingAuth : true,
    isSigningUp : false,
    isLogginIn : false,

    checkAuth : async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser : res.data,})
        } catch (error) {
            console.log('Errorin auth check');
            set({authUser : null});
        } finally {
            set({ischeckingAuth : false});
        }
    },

    signup :async(data) => {
        set({isSigningUp : true});
        try {
            const res = await axiosInstance.post('auth/signup', data);
            set({authUser : res.data});

            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isSigningUp : false});
        }
    },

    login :async(data) => {
        set({isLoggingIn : true});
        try {
            const res = await axiosInstance.post('auth/login', data);
            set({authUser : res.data});

            toast.success("Logged is successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isLogginIn : false});
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Error logging out");
            console.log("Logout error:", error);
        }
    },

    updateProfile : async (data)=>{
        try {
            const res = await axiosInstance.put('/auth/update-profile',data);
            set({authUser:res.data});
            toast.success('Profile Updated');
        } catch (error) {
            console.log('error in update Profile', error);
            toast.error(error.response.data.message);
        }
    }
}));