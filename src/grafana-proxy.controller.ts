import { Controller, Req, Res, UnauthorizedException, UseGuards, Get, Param, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { GrafanaProxyService } from './grafana-proxy.service';
import { AuthenticatedRequest, AuthGuard } from './auth.guard';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Controller('data/panels')
export class GrafanaProxyController {
    constructor(private readonly proxyService: GrafanaProxyService) { }

    private readonly grafanaBaseUrl = 'http://localhost:3000';

    private readonly panelIdMap = {
        'logs': 1,
    };

    // Proxy for general Grafana assets and requests
    private generalProxy = createProxyMiddleware({
        target: this.grafanaBaseUrl,
        changeOrigin: true,
        selfHandleResponse: false, // Let Grafana handle responses
    });

    private logsPanelProxy = createProxyMiddleware({
        target: this.grafanaBaseUrl,
        changeOrigin: true,
        selfHandleResponse: false, // Let Grafana handle responses
        on: {
            proxyReq: (proxyReq, req: AuthenticatedRequest) => {
                if (!req.user) {
                    return;
                }

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

                proxyReq.path = `${proxyReq.path.replace('/logs', '/d-solo/main-dashboard')}?${queryParams.toString()}`;

                console.log(proxyReq);
            },
        },
        // ws: true, // Proxy websockets
    })

    @UseGuards(AuthGuard)
    @Get('logs')
    async getLogsPanel(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('Unauthorized access');
        }
        console.log('serving', 'logs', req.url);

        this.logsPanelProxy(req, res, (err) => {
            if (err) {
                console.error('Proxy Error', err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error proxying request' });
            }
        });
    }

    @UseGuards(AuthGuard)
    @Get('/*path')
    async getOthers(@Req() req: AuthenticatedRequest, @Res() res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('Unauthorized access');
        }
        console.log('serving', 'general', req.url);
        this.generalProxy(req, res, (err) => {
            if (err) {
                console.error('Proxy Error', err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error proxying request' });
            }
        });
    }

    // @UseGuards(AuthGuard)
    // @Get('*')
    // async proxyOtherRequests(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    //     if (!req.user) {
    //         throw new UnauthorizedException('Unauthorized access');
    //     }
    //     console.log('serving', req.url);
    //     this.generalProxy(req, res, (err) => {
    //         if (err) {
    //             console.error('Proxy Error', err);
    //             res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error proxying request' });
    //         }
    //     });
    // }
}
