FROM node:16-alpine3.14

LABEL maintainer="NM <nmaltsev@argans.eu>" \
	org.opencontainers.image.title="ac/site" \
	org.opencontainers.image.description=""


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

COPY ./project/. ./
COPY ./build.sh ./

RUN chmod +x ./build.sh

CMD sh


