FROM node:12.10.0-alpine

# Set work dir
WORKDIR /var/lib/app/

# Install build dependencies
RUN apk --no-cache add python make g++

# Copy package.json and install depedencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Remove build dependencies
RUN apk update && apk del python make g++

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

