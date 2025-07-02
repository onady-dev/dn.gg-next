"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import api from "@/lib/axios";

const Login = ({ setIsSignup }: { setIsSignup: (isLogin: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/user/login`, { email, password })
    .then((response) => {
      setUser({ id: response.data.user.id, email: response.data.user.email, groupId: response.data.user.groupId, accessToken: response.data.accessToken });
    })
    .catch((error) => {
      if(error.response.status === 401) {
        alert("Invalid email or password");
      }else if(error.response.status === 404) {
        alert("User not found");
      }else {
        alert("Login failed");
      }
    });
  };

  const handleSignup = () => {
    setIsSignup(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f9f9f9" }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", minWidth: 320 }}>
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
          />
          <button type="submit" style={{ padding: 10, borderRadius: 6, background: "#0070f3", color: "#fff", border: "none", fontWeight: 600 }}>
            Login
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span>Don't have an account?</span>
          <button onClick={handleSignup} style={{ marginLeft: 8, color: "#0070f3", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 