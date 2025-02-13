import { Controller, Req, Res, UnauthorizedException, UseGuards, Get, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedRequest, AuthGuard } from './auth.guard';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { grafanaProxyConfig } from './const';
import { URLSearchParams } from 'url';

/**
 * A simple enough implementation of how the grafana proxy should be set up.
 * This will allow you to serve grafana panels with custom URLs, while hiding
 * the actual grafana URL (specially when your grafana is self-hosted and private).
 * Also, showing how an auth guard can be added to only load the panels in iframe
 * if your user is authenticated.
 */
@Controller(grafanaProxyConfig.ENDPOINT)
export class GrafanaProxyController {
    // Proxy for general Grafana assets and other requests
    private generalProxy = createProxyMiddleware({
        target: grafanaProxyConfig.SERVER,
        changeOrigin: true,
        selfHandleResponse: false, // Let Grafana handle responses
    });

    private createPanelProxy(panel: string) {
        if (!grafanaProxyConfig.PANEL_MAP[panel]) {
            return;
        }

        return createProxyMiddleware({
            target: grafanaProxyConfig.SERVER,
            changeOrigin: true,
            selfHandleResponse: false,
            on: {
                proxyReq: (proxyReq, req: AuthenticatedRequest) => {
                    if (!req.user) {
                        return;
                    }
                    const [_, search] = proxyReq.path.split('?');
                    const queryParams = new URLSearchParams(search || '');
                    queryParams.append('orgId', req.user.orgId);
                    queryParams.append('panelId', grafanaProxyConfig.PANEL_MAP[panel].id.toString());
                    Object.keys(grafanaProxyConfig.DEFAULT_QUERY).forEach((key: string) => {
                        if (['from', 'to'].includes(key) && queryParams.get(key)) {
                            // Retain any timerange provided from original request
                            return;
                        }
                        queryParams.append(key, grafanaProxyConfig.DEFAULT_QUERY[key]);
                    });

                    proxyReq.path = `/d-solo/main-dashboard?${queryParams.toString()}`;
                },
            },
            ws: true, // Proxy websockets
        })
    }

    // Add panel specific routes this way
    @UseGuards(AuthGuard)
    @Get(grafanaProxyConfig.PANEL_MAP.logs.path)
    async getLogsPanel(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('Unauthorized access');
        }

        const panelProxy = this.createPanelProxy(grafanaProxyConfig.PANEL_MAP.logs.name);

        if (!panelProxy) {
            return res.status(HttpStatus.OK);
        }

        panelProxy(req, res, (err) => {
            if (err) {
                console.error('Proxy Error', err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error proxying request' });
            }
        });
    }

    // Add this for all the assets and other grafana URLs
    @UseGuards(AuthGuard)
    @Get('/*path')
    async getOthers(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('Unauthorized access');
        }
        this.generalProxy(req, res, (err) => {
            if (err) {
                console.error('Proxy Error', err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error proxying request' });
            }
        });
    }
}
