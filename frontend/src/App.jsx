import React, { use, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { UseAuthStore } from './store/useAuthstore';
import PageLoader from './components/PageLoader';
import {Toaster} from 'react-hot-toast';

function App() {
  const {checkAuth, ischeckingAuth, authUser} = UseAuthStore();

    useEffect(()=>{
    checkAuth()
  },[checkAuth]); 

  console.log(authUser);

    if(ischeckingAuth) return <PageLoader />

  return (
    <div className='min-h-screen bg-cyan-950 relative flex items-center justify-center p-4 overflow-hidden'>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415522_1px,transparent_1px),linear-gradient(to_bottom,#33415522_1px,transparent_1px)] bg-[length:32px_32px]" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />

      <Routes>
        <Route path='/' element={authUser? <ChatPage /> : <Navigate to={'/login'} />} />
        <Route path='/login' element={!authUser? <LoginPage /> : <Navigate to={'/'} />} />
        <Route path='/signup' element={!authUser? <SignUpPage /> : <Navigate to={'/'} />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
