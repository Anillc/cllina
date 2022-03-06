FROM node:latest

COPY ./ /root/cllina
RUN cd /root/cllina && \
    chmod +x gai.sh && ./gai.sh && \
    apt update && \
    apt install -y cmake make gcc chromium fonts-wqy-microhei && \
    yarn install

ENTRYPOINT ["bash", "-c", "cd /root/cllina && yarn start"]