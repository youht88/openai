FROM alpine

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /home

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update
RUN apk add chromium
RUN apk add nodejs npm
RUN apk add xvfb
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN npm install puppeteer-core

COPY package.json ./
RUN npm install

COPY . /home

ENV DISPLAY=:99 
EXPOSE 3000
#CMD sh -c "top"
CMD sh -c "Xvfb :99 -screen 0 800x600x24 -ac & npm start"
