import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthGuard } from './auth.guard';
import { GrafanaProxyController } from './grafana-proxy.controller';
import { GrafanaProxyService } from './grafana-proxy.service';

@Module({
  imports: [],
  controllers: [AppController, GrafanaProxyController],
  providers: [AuthGuard, GrafanaProxyService],
})
export class AppModule {}
