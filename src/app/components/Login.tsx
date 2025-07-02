"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";

const Login = ({ setIsSignup }: { setIsSignup: (isLogin: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add login logic here (API 연동 필요)
    // 임시로 로그인 성공 처리
    setUser({ id: "1", username: email.split("@")[0], email, groupId: 1 });
    alert("Login success! (dummy user info saved)");
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