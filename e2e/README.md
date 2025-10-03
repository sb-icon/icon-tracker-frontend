
## Commands 

```shell
# All 
pytest -v -s --html=e2e/reports/report.html --capture=tee-sys e2e/test_cases/
# Individual 
pytest -v -s -m "main_page and address_page" --html=e2e/reports/report.html --capture=tee-sys e2e/test_cases/
```

### Running on Custom Networks

TODO: Need to be able to inject env vars before setting up app. 

[#248](https://github.com/sb-icon/icon-tracker-frontend/issues/248)

```shell
export REACT_APP_RPC_ENDPOINT=localhost:9000
pytest -v -s -m "main_page" --html=e2e/reports/report.html --capture=tee-sys e2e/test_cases/
```

### Running on Custom Networks

TODO: Need to be able to inject env vars before setting up app. 

[#248](https://github.com/sb-icon/icon-tracker-frontend/issues/248)

```shell
export REACT_APP_RPC_ENDPOINT=localhost:9000
pytest -v -s -m "main_page" --html=e2e/reports/report.html --capture=tee-sys e2e/testCases/
```

## Running on different networks 

To change the network, change the `config/config.ini` -> baseurl which modifies the window the tracker is running on. 
