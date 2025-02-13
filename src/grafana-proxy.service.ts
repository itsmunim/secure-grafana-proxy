import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthenticatedRequest } from './auth.guard';

@Injectable()
export class GrafanaProxyService {
  private readonly grafanaBaseUrl = 'http://localhost:3000';

  private readonly panelIdMap = {
    'logs': 1,
  };

  // Proxy for general Grafana assets and requests
  private generalProxy = createProxyMiddleware({
    target: this.grafanaBaseUrl,
    changeOrigin: true,
    selfHandleResponse: false, // Let Grafana handle responses
    ws: true, // Proxy websockets
    pathRewrite: function (path, req: AuthenticatedRequest) {
      if (!req.user) {
        return;
      }
      
      if (path.endsWith('/logs')) {
        const queryParams = new URLSearchParams({
          orgId: req.user.orgId,
          panelId: this.panelIdMap['logs'].toString(),
          from: 'now-15m',
          to: 'now',
          theme: 'dark',
          timezone: 'browser',
          '__feature.dashboardSceneSolo': 'true',
          'kiosk': 'tv'
        });

        return `${path.replace('/logs', '/')}?${queryParams.toString()}`;
      }
    }

  });

  private logsPanelProxy = createProxyMiddleware({
    target: this.grafanaBaseUrl,
    changeOrigin: true,
    selfHandleResponse: false, // Let Grafana handle responses
    ws: true, // Proxy websockets
  });

  // Proxy for logs panel (injects query params)
  async proxyToLogsPanel(req: Request, res: Response, user: { userId: string; orgId: string }) {
    const queryParams = new URLSearchParams({
      orgId: user.orgId,
      panelId: this.panelIdMap['logs'].toString(),
      from: 'now-15m',
      to: 'now',
      theme: 'dark',
      timezone: 'browser',
      '__feature.dashboardSceneSolo': 'true',
      'kiosk': 'tv'
    });

    // Update request path to target Grafana's dashboard with correct params
    req.url = `/d-solo/main-dashboard?${queryParams.toString()}`;

    // Proxy to Grafana
    this.generalProxy(req, res, (err) => {
      if (err) {
        console.error('Proxy Error:', err);
        res.status(500).json({ message: 'Error proxying request' });
      }
    });
  }

  // 🔹 General proxy for everything else
  async generalGrafanaProxy(req: Request, res: Response) {
    this.generalProxy(req, res, (err) => {
      if (err) {
        console.error('Proxy Error:', err);
        res.status(500).json({ message: 'Error proxying request' });
      }
    });
  }
}
