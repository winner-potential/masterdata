FROM node:alpine

# Set work dir
WORKDIR /var/lib/app/

# Copy package.json and install depedencies, init wait-for script
COPY wait-for backend/package.json backend/package-lock.json ./
RUN cd /var/lib/app/ && npm install && chmod +x wait-for

# Copy backend and frontend
COPY frontend/dist/masterdata ./public/admin
COPY readonly/dist/masterdata-readonly ./public/viewer
COPY login/dist/masterdata-login ./public/login
COPY backend/ ./
RUN mkdir -p views && \
    mv public/admin/index.html views/admin.html && \
    mv public/viewer/index.html views/viewer.html && \
    mv public/login/index.html views/login.html

# Expose port
EXPOSE 3000

CMD ["sh","-c","npm start"]

