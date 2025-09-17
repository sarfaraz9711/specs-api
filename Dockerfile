# base image
FROM node:14.21.3

# set working directory
WORKDIR /usr/src/api

# install and cache api dependencies
COPY package*.json ./
ADD package.json /usr/src/api/package.json
#RUN npm config set strict-ssl false
#RUN npm install
RUN npm install pm2 -g
#RUN npm start build
# Bundle app source
COPY . .

# Specify port
EXPOSE 3000
# start app
#CMD ["npm", "start", "serve"]
CMD ["cd", "/usr/src/api"]
CMD ["pm2", "start", "npm", "--name", "'Redchief API 3000'", "--", "start"]
CMD ["pm2", "log"]
