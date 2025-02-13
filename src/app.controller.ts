import { Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { TEST_USER, USER_COOKIE_NAME } from './auth.guard';
import { Response } from 'express';

@Controller('api')
export class AppController {
  @Post('login')
  async login(@Res() response: Response) {
    const userString = JSON.stringify(TEST_USER);
    const encodedUser = Buffer.from(userString).toString('base64');

    response.cookie(USER_COOKIE_NAME, encodedUser, {
      httpOnly: true,
      sameSite: 'strict',
    });

    return response.status(HttpStatus.OK).json({
      message: 'Login successful',
    });
  }
}
