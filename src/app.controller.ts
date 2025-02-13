import { Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { TEST_USER, USER_COOKIE_NAME } from './auth.guard';
import { Response } from 'express';

// A basic api controller to set a fake logged in cookie.
@Controller('api')
export class AppController {
  @Post('login')
  async login(@Res() res: Response) {
    const userString = JSON.stringify(TEST_USER);
    const encodedUser = Buffer.from(userString).toString('base64');

    res.cookie(USER_COOKIE_NAME, encodedUser, {
      httpOnly: true,
      sameSite: 'strict',
    });

    return res.status(HttpStatus.OK).json({
      message: 'Login successful',
    });
  }
}
