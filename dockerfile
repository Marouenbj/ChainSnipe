# Use the official Node.js image as the base image
FROM node:22.2.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the application runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
