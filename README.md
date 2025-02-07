# Secure Grafana Proxy
An authenticated, authorized proxy for a private hosted grafana.
Useful when you want to host a grafana embed panel/dashboard in your web application.
This is a test implementation to provide you an idea of how it can be done.

## How to Test

### Project setup

```bash
$ npm install
```

### Provision fake data and dashboards for Grafana

Create a file `/etc/grafana/provisioning/datasources/datasource.yml` with following content-

```yaml
apiVersion: 1
datasources:
  - name: TestData DB
    type: testdata
    access: proxy
    isDefault: true
```

Create a file `/etc/grafana/provisioning/dashboards/dashboard.yml` with following content-

```yaml
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /etc/grafana/provisioning/dashboards
```

Now, create a dashboard with fake content at `/etc/grafana/provisioning/dashboards/sample-dashboard.json`-

```json
{
  "dashboard": {
    "id": null,
    "uid": "test-dashboard",
    "title": "Fake Logs Dashboard",
    "panels": [
      {
        "id": 1,
        "title": "Fake Logs",
        "type": "logs",
        "targets": [
          {
            "datasource": "TestData DB",
            "refId": "A",
            "type": "logs",
            "expr": "Generate random log messages"
          }
        ]
      }
    ]
  },
  "overwrite": true
}
```

### Compile and run the project

```bash
# start the grafana and verify at http://localhost:3000
$ docker-compose up -d

# proxy server
$ npm run start
```
