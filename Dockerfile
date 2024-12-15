FROM denoland/deno:latest

WORKDIR /tafe-weather-rest-api

COPY . .
USER deno

RUN deno cache server.ts
RUN deno cache main.ts

EXPOSE 3085 3086

CMD [ "deno", "task", "start" ]