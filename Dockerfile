FROM node:latest

COPY ./ /root/cllina
#RUN export canvas_binary_host_mirror=https://npm.taobao.org/mirrors/node-canvas-prebuilt/
RUN cd /root/cllina && \
    apt update && \
    apt install -y cmake make gcc chromium && \
    yarn install

ENTRYPOINT ["bash", "-c", "cd /root/cllina && yarn start"]