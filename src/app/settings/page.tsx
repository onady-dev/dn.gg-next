"use client";

import { useEffect, useState } from "react";
import Signup from "../components/Signup";
import Login from "../components/Login";
import { useAuthStore } from "@/app/stores/useAuthStore";

const SettingsPage = () => {
  const {user, logout} = useAuthStore((state) => state);
  const [isLogin, setIsLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if(user) {
      setIsLogin(true);
    }
  }, [user]);

  return (
    <>
      {!isLogin ? (
        isSignup ? <Signup setIsSignup={setIsSignup}/> : <Login setIsSignup={setIsSignup} />
      ) : (
        <div style={{ marginTop: 80, textAlign: "center" }}>
          <button
            onClick={() => {
              logout();
              setIsLogin(false);
              setIsSignup(false);
            }}
            style={{ marginLeft: 12, padding: '6px 16px', borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            로그아웃
          </button>
        </div>
      )}
    </>
  )
};


export default SettingsPage;

