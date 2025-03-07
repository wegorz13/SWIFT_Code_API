# Use official Node.js image as base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --include=dev

# Copy the rest of the application files
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
