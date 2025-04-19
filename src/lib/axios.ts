import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 브라우저 환경인지 확인하는 함수
const isBrowser = () => typeof window !== "undefined";

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 필요한 경우 여기에서 처리 (브라우저 환경에서만 localStorage 사용)
    if (isBrowser()) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 처리 (브라우저 환경에서만 localStorage 사용)
    if (isBrowser() && error.response?.status === 401) {
      // 인증 에러 처리
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
