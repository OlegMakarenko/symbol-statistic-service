FROM node
COPY . /app/src
WORKDIR /app/src
RUN ["npm","install"]
EXPOSE 8007
CMD ["npm","run","dev"]
