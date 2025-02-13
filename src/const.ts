/**
 * A config to control how the grafana proxy controller will behave.
 * Feel free to change as you please.
 */
export const grafanaProxyConfig = {
    ENDPOINT: 'data/panels', // At which endpoint you will serve the grafana panels at
    SERVER: 'http://localhost:3000', // Your grafana server address
    PANEL_MAP: {
        // Named panels to actual grafana panel ids, so that you can do urls like /data/panels/logs
        'logs': {
            id: '1',
            path: 'logs',
            name: 'logs',
        },
        // Example-
        // 'metrics': {
        //     id: '2',
        //     path: 'performance-metrics',
        //     name: 'metrics',
        // },
    },
    DASHBOARD: 'main-dashboard', // The grafana dashboard to serve the panels from
    DEFAULT_QUERY: {
        // Add any other default query params to pass to grafana
        from: 'now-15m',
        to: 'now',
        theme: 'dark',
        timezone: 'browser',
        '__feature.dashboardSceneSolo': 'true',
        'kiosk': 'tv',
    },
};