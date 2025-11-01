FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using clean install to avoid optional dependencies
RUN npm ci --no-optional

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
