FROM node:16

# Prepare working directory
WORKDIR /usr/src/app
RUN mkdir packages
RUN mkdir packages/app
RUN mkdir packages/sql
RUN mkdir packages/shared
RUN mkdir packages/desktop
RUN mkdir packages/parser

ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXTAUTH_URL="https://desktop.wowarenalogs.com"

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY packages/app/package.json ./packages/app
COPY packages/sql/package.json ./packages/sql
COPY packages/shared/package.json ./packages/shared
COPY packages/desktop/package.json ./packages/desktop
COPY packages/parser/package.json ./packages/parser
COPY packages/recorder/package.json ./packages/recorder
RUN npm ci
COPY ./packages/app ./packages/app
COPY ./packages/sql ./packages/sql
COPY ./packages/shared ./packages/shared
COPY ./packages/desktop ./packages/desktop
COPY ./packages/parser ./packages/parser
COPY ./packages/recorder ./packages/recorder

# Build 
RUN npm run build:sql
RUN npm run build:parser
RUN npm run build:desktop

CMD npm run start:desktop
