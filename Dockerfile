FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port the app will run on
EXPOSE 5001

# Start the application
CMD ["node", "index.js"]
