import Cookies from 'js-cookie';
import { loginUser } from '@/api/auth.api';
import { LoginFormValues } from '@/schemas/auth.schema';

export async function loginAction(values: LoginFormValues) {
  const response = await loginUser(values);
  Cookies.set('token', response.accessToken, {
    expires: 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response.user;
}
