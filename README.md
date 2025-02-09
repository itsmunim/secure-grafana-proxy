# Secure Grafana Proxy
An authenticated, authorized proxy for a private hosted grafana.
Useful when you want to host a grafana embed panel/dashboard in your web application.
This is a test implementation to provide you an idea of how it can be done.

## How to Test

### Project setup

```bash
$ npm install
```

### Compile and run the project

```bash
# start the grafana and verify at http://localhost:3000
$ docker-compose up -d

# proxy server
$ npm run start
```
