# Node.js 기반 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 설정 파일들 복사
COPY postcss.config.mjs ./
COPY tailwind.config.mjs ./
COPY next.config.mjs ./
COPY tsconfig.json ./

# 소스 코드 복사
COPY src ./src
COPY public ./public

# 빌드
RUN npm run build

# 프로덕션 서버 실행
CMD ["npm", "run", "start"]

# 포트 노출
EXPOSE 3000 