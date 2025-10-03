# ICON Tracker

[![loopchain](https://img.shields.io/badge/ICON-API-blue?logoColor=white&logo=icon&labelColor=31B8BB)](https://shields.io) 
[![GitHub Release](https://img.shields.io/github/release/sb-icon/icon-tracker-frontend.svg?style=flat)]() 
![](https://github.com/sudoblock/icon-tracker-frontend/workflows/push-main/badge.svg?branch=main) 
![](https://img.shields.io/github/license/sb-icon/icon-tracker-frontend)

[//]: # ([![codecov]&#40;https://codecov.io/gh/sb-icon/icon-tracker-frontend/branch/main/graph/badge.svg&#41;]&#40;https://codecov.io/gh/sb-icon/icon-tracker-frontend&#41;)
[//]: # (![Uptime]&#40;https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fgeometry-labs%2Ficon-status-page%2Fmaster%2Fapi%2Fdev-tracker-frontend-service%2Fuptime.json&#41; )

### Development Setup

##### Local

```sh
# Install dependencies
npm install
```

**Mainnet** 
```sh
npm start
```

**Testnets**
```shell
npm run start --network=lisbon
```

**Custom**
```shell
npm run start \
  --rpc-endpoint=https://api.lisbon.icon.community \
  --api-endpoint=https://tracker.lisbon.icon.community \
  --wss-endpoint=wss://tracker.lisbon.icon.community \
  --nid=42
```

##### Docker

In order to point the docker container at custom endpoints, will need to build the container with the appropriate environment variables set. 

- To set to new network and use default endpoints set `REACT_APP_NETWORK_NAME` to mainnet, lisbon, or berlin
- To run with a custom backend / endpoint set 
  - REACT_APP_RPC_ENDPOINT  
  - REACT_APP_API_ENDPOINT 
  - REACT_APP_WSS_ENDPOINT

After setting these environment variables run:

```shell
docker-compose build 
docker-compose up -d 
```

#### Custom Backend 

Please reference [gochain-local-community](https://github.com/sb-icon/gochain-local-community) for instructions on how to deploy / a custom backend along with this frontend. Comes up practically one click. 

### Build:

```sh
# build files to './build'
npm run build
```

### Test:

**Unit**
```sh
npm run test
```

**e2e**

The e2e tests run with selenium and pytest. To run them, you will first need to have python installed with the virtual environment module. Then run: 

```shell
# Install e2e test dependencies (pytest / selenium)
python3 -m venv env
source env/bin/activate
pip install -r e2e/requirements.txt
# Run the application 
npm run start 
# Then you can run the tests in another terminal 
make test-e2e
```

### Set Endpoints 

1. Command line - Also see custom network above

```shell
npm run start --network=berlin
```

2. Environment Variables

```shell
export \
  REACT_APP_RPC_ENDPOINT=https://lisbon.net.solidwallet.io \
  REACT_APP_API_ENDPOINT=https://tracker.lisbon.icon.community/ \
  REACT_APP_WSS_ENDPOINT=wss://tracker.lisbon.icon.community/ \
  REACT_APP_NID=42
```

3. `.env` File 

**./.env**
```dotenv
REACT_APP_RPC_ENDPOINT=https://lisbon.net.solidwallet.io
REACT_APP_API_ENDPOINT=https://tracker.lisbon.icon.community/
REACT_APP_WSS_ENDPOINT=wss://tracker.lisbon.icon.community/
REACT_APP_NID=42
```

Env files will additionally need to be sourced (ie `source .env` to inject into docker container builds)

See the [local](#local) and [docker](#docker) sections for additional information on how to run in both settings.  

## Contributing 

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for within this repo to generate our [changelog](./CHANGELOG.md) and manage our release cycle. All commits should use one of these three prefixes:

- feat: <commit message>
  - Implement a new major feature to the tracker (ie a new page / view / data)
  - Increments minor version 
  - Should tag issue in commit message (ie `feat: add awesome page #123`)
- fix: <commit message>
  - Fix something / implement a small change per new standards (ie add some governance variable)
  - Increments patch version
  - Should tag issue in commit message (ie `fix: some page #123`)
- chore: <commit message>
  - All commits except for above 
  - Does not increment version 
  - No need to tag issue unless relevant (ie `chore: move some thing #123`)

All contributions should be in the form of a PR with branch names suggestive of the issue being addressed (ie `fix-something`).

[License](./LICENSE)
