import { create } from "zustand";

export const UseAuthStore = create((set) => ({
    authUser : {name:'ZAHID', _id:123, age:20},
    isLoggedIn : false,

    login : () =>{
        console.log('We just logged In');
        set({isLoggedIn : true});
    }
}));