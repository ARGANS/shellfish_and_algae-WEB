FROM node:14-alpine3.12@sha256:55bf28ea11b18fd914e1242835ea3299ec76f5a034e8c6e42b2ede70064e338c AS build
LABEL NM <nmaltsev@argans.eu>

ENV NODE_ENV=production
ENV STAGE=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./project/package.json ./

## Atttention: Please, do not use --no-optional while the issue is open https://github.com/vercel/next.js/issues/20456
## RUN npm install --production --no-optional
RUN npm install --production --also=dev

COPY ./project/ ./
RUN npx next telemetry disable && \
    npm run build --production && \
    npm run export


#############################################

FROM nginx:1.19.3-alpine
LABEL NM <nmaltsev@argans.eu>


ENV ROOT=/opt/app
RUN mkdir -p $ROOT

COPY ./server/start.sh $ROOT/
COPY ./server/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /opt/app/out/ /usr/share/nginx/html/
COPY ./server/certs/ /etc/nginx/conf.d/certs/


WORKDIR $ROOT
RUN chmod +x $ROOT/start.sh


EXPOSE 80
EXPOSE 443
STOPSIGNAL SIGTERM
CMD ["/opt/app/start.sh"]

