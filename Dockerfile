FROM node:16


#### CHROME

RUN apt-get update && apt-get install -yq --no-install-recommends libc6 libcairo2 \
    libexpat1 libfontconfig1 libgcc1 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
    libxcb1 libxext6 \
    libxrender1 libnss3
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    (dpkg -i google-chrome-stable_current_amd64.deb || true) && \
    apt-get -f -y install && \
    rm google-chrome-stable_current_amd64.deb

#### CONSTS

WORKDIR /app
CMD yarn start        

#### Source

COPY package.json .
RUN yarn install --prod
COPY . . 
