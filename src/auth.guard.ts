import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export const USER_COOKIE_NAME = 'user__';
export const TEST_USER = {
	userId: 123,
	orgId: 1,
};

export interface AuthenticatedRequest extends Request {
	user?: {
		orgId: string;
		userId: string;
	};
}

// A basic auth guard implementation, replace with yours.
@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const cookies = request.cookies;

		if (!cookies || !cookies[USER_COOKIE_NAME]) {
			throw new UnauthorizedException('Missing authentication cookie');
		}

		try {
			const decoded = Buffer.from(cookies[USER_COOKIE_NAME], 'base64').toString('utf-8');
			const user = JSON.parse(decoded);

			if (user.userId !== TEST_USER.userId || user.orgId !== TEST_USER.orgId) {
				throw new UnauthorizedException('Invalid authentication token');
			}

			request.user = user;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Invalid authentication token');
		}
	}
}
