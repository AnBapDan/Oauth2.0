import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { OauthModule } from './oauth/oauth.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { CookiesMiddleware } from './middleware/cookie.middleware';

@Module({
  imports: [ OauthModule, AuthModule],
  controllers: [],
  providers: [AuthService],
})


export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CookiesMiddleware)
      .forRoutes({ path: '/auth', method: RequestMethod.GET },
      { path: '/auth', method: RequestMethod.POST },
      {path: '/cmd/auth', method: RequestMethod.GET},
      {path: '/changepasswd', method: RequestMethod.POST},
      {path: '/changepasswd', method: RequestMethod.GET})

  }
}