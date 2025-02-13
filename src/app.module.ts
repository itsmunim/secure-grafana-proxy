import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthGuard } from './auth.guard';
import { GrafanaProxyController } from './grafana-proxy.controller';

@Module({
  imports: [],
  controllers: [AppController, GrafanaProxyController],
  providers: [AuthGuard],
})
export class AppModule { }
