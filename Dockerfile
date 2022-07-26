FROM node:lts-alpine

RUN apk add --no-cache \
    chromium nss freetype harfbuzz \
    ca-certificates ttf-freefont \
    font-noto-cjk graphviz inkscape

ADD gai.conf /etc/gai.conf

COPY ./ /root/cllina

RUN cd /root/cllina && \
    chmod +x script.sh && \
    yarn install

ENTRYPOINT ["sh", "-c", "cd /root/cllina && yarn start"]