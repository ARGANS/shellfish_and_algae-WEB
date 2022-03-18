FROM python:3.10-slim-bullseye
LABEL maintainer="NM <nmaltsev@argans.eu>" \
	org.opencontainers.image.title="ac/dashboard" \
	org.opencontainers.image.description=""

EXPOSE 80
STOPSIGNAL SIGTERM
ARG HOME="/opt/app"

RUN mkdir -p $HOME 
WORKDIR $HOME


COPY repo/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt
COPY repo/. .
# DSHBRD_BASE_ROUTE='/api/v1' uvicorn main:app --reload --host 0.0.0.0 --port 9029
