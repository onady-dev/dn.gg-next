"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = ({ setIsSignup }: { setIsSignup: (isLogin: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // TODO: Add signup logic here
    alert("Signup logic not implemented");
  };

  const handleLogin = () => {
    setIsSignup(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f9f9f9" }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", minWidth: 320 }}>
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>Sign Up</h2>
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
          />
          <button type="submit" style={{ padding: 10, borderRadius: 6, background: "#0070f3", color: "#fff", border: "none", fontWeight: 600 }}>
            Sign Up
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span>Already have an account?</span>
          <button onClick={handleLogin} style={{ marginLeft: 8, color: "#0070f3", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup; 