FROM node:14-alpine3.12@sha256:55bf28ea11b18fd914e1242835ea3299ec76f5a034e8c6e42b2ede70064e338c
LABEL NM <nmaltsev@argans.eu>
EXPOSE 3000
RUN apk add nano

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

RUN 	mkdir -p /opt/app && \
		mkdir -p /opt/app/out && \
		mkdir -p /opt/app/.next && \
		mkdir -p /opt/app/out

WORKDIR /opt/app

COPY ./project/package.json ./
# All Additional packages will be installed using this command
## Serve is an optional dependency
RUN npm install --production --silent --also=dev

# CMD npm run serve && npm run update && sh
# CMD npm run serve && sh
