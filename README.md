# Secure Grafana Proxy
A secure proxy service that enables authenticated and authorized access to privately hosted Grafana instances. This solution allows you to safely embed Grafana panels and dashboards within your web applications while maintaining strict access control. The implementation demonstrates best practices for secure Grafana integration through a proxy layer.

## Usecases
This proxy solution is ideal for scenarios where you need to securely embed Grafana panels in your web application:

1. You have a private, self-hosted Grafana instance that needs to remain secure
2. Your application implements authentication and authorization, and you want to ensure only authorized users can access specific Grafana panels
3. You need to abstract away sensitive Grafana implementation details (URLs, query parameters, etc.) behind a secure proxy endpoint

For example, this enables you to safely embed monitoring dashboards in your SaaS platform while maintaining control over access and keeping your Grafana infrastructure private.

## How to Test

### Project Setup

```bash
$ npm install
```

```bash
# start the grafana and verify at http://localhost:3000
$ docker-compose up
```

The Grafana instance comes pre-configured with a sample dashboard containing mock data panels for testing purposes. The configuration details can be found in the `grafana/provisioning` directory. When setting up your own Grafana instance, ensure its configuration aligns with the properties defined in `grafana/grafana.ini` to maintain compatibility with the proxy service.

### Run the Service

```bash
$ npm run start
# or
$ npm run start:dev # watch mode
```
Once the service is running, you can access the demo application at [http://localhost:8080](http://localhost:8080). The demo interface provides a practical example of how Grafana panels can be securely embedded within your web application.

**Note:** The service is implemented using [NestJS](https://nestjs.com/), though the core concepts can be adapted to any other frameworks. For proxying functionality, it leverages the `http-proxy-middleware` package which provides HTTP proxy capabilities.
