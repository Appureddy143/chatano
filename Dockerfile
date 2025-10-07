# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application's code
COPY . .

# Your app binds to this port
EXPOSE 10000

# Define the command to run your app
CMD [ "npm", "start" ]
