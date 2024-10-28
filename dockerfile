# Step 1: Use an official Node.js image as a base
FROM node:18-alpine as build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Step 4: Clean the npm cache and install dependencies with --legacy-peer-deps and --force
RUN npm cache clean --force && npm install --legacy-peer-deps --force

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the React app
RUN npm run build

# Step 7: Use an official NGINX image to serve the built app
FROM nginx:alpine

# Step 8: Copy the built React app to NGINX's default public directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose port 80
EXPOSE 80

# Step 10: Start NGINX when the container starts
CMD ["nginx", "-g", "daemon off;"]
