FROM node:18-alpine

WORKDIR /app

# Copy package files (including clean package-lock.json without pdf-parse)
COPY package*.json ./

# Install dependencies using the clean package-lock.json
RUN npm ci --no-optional

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
