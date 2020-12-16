FROM debian:stretch-20201209-slim

RUN apt-get update && apt-get install -y curl unzip

RUN useradd -ms /bin/bash deno


USER deno

WORKDIR $HOME/app

COPY . .

# Install deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh

RUN echo export DENO_INSTALL="/home/deno/.deno" >> $HOME/.bashrc &&\
    export PATH="$DENO_INSTALL/bin:$PATH" >> $HOME/.bashrc

#EXPOSE 8001

CMD /home/deno/.deno/bin/deno run --allow-net --allow-env --allow-read=.env,.env.example,.env.defaults index.js
