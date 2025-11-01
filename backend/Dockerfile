FROM node:18-alpine

WORKDIR /app

# Copy package files (handle both root and backend directory contexts)
COPY backend/package*.json ./

# Install dependencies using clean install
RUN npm ci --omit=optional

# Copy application code from backend directory
COPY backend/ .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
