ARG BDB_VERSION="4.8.30.NC"

FROM lepetitbloc/bdb:$BDB_VERSION

ARG USE_UPNP=1
ARG WALLET="dash"
ARG BASE_DIR=".dash/"
ARG CONFIG_FILE="dash.conf"
ARG PORT=9999
ARG RPC_PORT=9999
ARG REPOSITORY="https://github.com/dashpay/dash.git"

ENV USE_UPNP=$USE_UPNP \
    WALLET=$WALLET \
    BASE_DIR=$BASE_DIR \
    CONFIG_FILE=$CONFIG_FILE \
    PORT=$PORT \
    RPC_PORT=$PORT

EXPOSE $PORT $RPC_PORT

RUN apt-get update -y && apt-get install -y \
    libssl-dev \
    libboost-system-dev \
    libboost-filesystem-dev \
    libboost-chrono-dev \
    libboost-program-options-dev \
    libboost-test-dev \
    libboost-thread-dev \
    libminiupnpc-dev \
    libqrencode-dev \
    libgmp-dev \
    libevent-dev \
    libzmq3-dev \
    automake \
    pkg-config \
    git \
    bsdmainutils \
&& rm -rf /var/lib/apt/lists/* \
&& useradd -lrUm $WALLET \
&& git clone --depth 1 $REPOSITORY /tmp/$WALLET

WORKDIR /tmp/$WALLET

# build
RUN chmod +x autogen.sh share/genbuild.sh src/leveldb/build_detect_platform \
&& ./autogen.sh \
&& ./configure CPPFLAGS="-I/usr/local/db4/include -O2" LDFLAGS="-L/usr/local/db4/lib" \
&& make \
&& strip src/${WALLET}d src/${WALLET}-cli src/${WALLET}-tx \
&& mv src/${WALLET}d /usr/local/bin/ \
&& mv src/${WALLET}-cli /usr/local/bin/ \
&& mv src/${WALLET}-tx /usr/local/bin/ \
&& rm -rf /tmp/$WALLET

USER $WALLET

WORKDIR /home/$WALLET

RUN mkdir -p data $BASE_DIR

COPY wallet/$CONF_DIRECTORY $BASE_DIR

ENTRYPOINT ["sh", "-c", "/usr/local/bin/${WALLET}d", "-reindex", "-printtoconsole", "-logtimestamps=1", "-datadir=data", "-conf=../${CONF_DIRECTORY}${CONFIG_FILE}", "-mnconf=../${CONF_DIRECTORY}masternode.conf", "-port=${CONF_DIRECTORY}", "-rpcport=9998"]
CMD ["-rpcallowip=127.0.0.1", "-server=1", "-masternode=0"]
