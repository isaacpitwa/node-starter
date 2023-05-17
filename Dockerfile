# Use a base image with Node.js installed
FROM node:14 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install project dependencies
RUN npm i 

# Copy the rest of the project files
COPY . .

# Build the TypeScript code
RUN npm run build

# Use a new base image without the build dependencies
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install production dependencies
RUN npm i 

# Expose the port your Node.js app listens on
EXPOSE 3000

# Start the Node.js application
CMD [ "node", "./dist/server.js" ]
