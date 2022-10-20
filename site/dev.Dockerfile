FROM node:16-alpine3.14

LABEL maintainer="NM <nmaltsev@argans.eu>" \
	org.opencontainers.image.title="ac/site" \
	org.opencontainers.image.description=""


EXPOSE 3000
RUN apk add nano
RUN apk add curl

ENV NEXT_TELEMETRY_DISABLED=1
# production | test | development
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

# The `npm install` command does not update already installed packages. 
# This might be needed if node_modules is on a docker volume so it needs to be updated
RUN npm update

COPY ./project/. ./
COPY ./build.sh ./
COPY ./download.sh ./
COPY ./csv.js ./
COPY ./list.js ./

RUN chmod +x ./build.sh
RUN chmod +x ./download.sh

# Downloading and parsing a csv file with datasets


CMD ./download.sh $ALGAE_DATASETS_LINK /opt/app/models/algae_datasets.json A && \
	./download.sh $SHELLFISH_DATASETS_LINK /opt/app/models/shellfish_datasets.json S && \
	./build.sh && sh

