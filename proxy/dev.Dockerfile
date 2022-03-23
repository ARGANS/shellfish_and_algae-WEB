FROM alpine:3.15 as init


ARG WORK_DIR="/opt/processing"
ARG SUBJ="/C=FR/ST=AM/L=SophiaAntipolis/O=ARGANS/OU=R&D/CN=test.com"

RUN mkdir -p $WORK_DIR
WORKDIR $WORK_DIR

RUN apk add --update openssl && \
    openssl req -x509 -newkey rsa:4096 -nodes -out public.crt -keyout private.key -days 365 -subj $SUBJ



## ***** NGINX *****



FROM nginx:1.21.6-alpine

LABEL maintainer="NM <nmaltsev@argans.eu>" \
	org.opencontainers.image.title="ac/proxy" \
	org.opencontainers.image.description=""

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY ./proxy/start.sh /opt/app/
COPY ./proxy/dev.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=init /opt/processing/public.crt /etc/nginx/conf.d/certs/
COPY --from=init /opt/processing/private.key /etc/nginx/conf.d/certs/
# DEPREACTED
# COPY ./staticsite/ /usr/share/nginx/html/


ARG WITH_UTILS
RUN if [[ -z "$WITH_UTILS" ]] ; \
    then echo "without utils" ; \
    else \
    apk add --update curl; \
    apk add --update nano; \
    fi

# RUN apk add --update curl && \
#     apk add --update nano

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && chmod +x /opt/app/start.sh


EXPOSE 80
EXPOSE 443
STOPSIGNAL SIGTERM

WORKDIR /etc/nginx/conf.d

CMD ["/opt/app/start.sh"]
