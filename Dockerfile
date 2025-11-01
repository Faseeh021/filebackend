FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install without cache to avoid pdf-parse issues
RUN rm -rf node_modules package-lock.json && npm install --no-optional

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
