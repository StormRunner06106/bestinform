FROM node:20-alpine as builder

WORKDIR /angular-ui

# Copy the package.json and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps 

# Copy rest of the files
COPY . .

# Build the project
RUN npm run build


FROM nginx:alpine
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the builder
COPY --from=builder /angular-ui/dist/ /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]