import Cookies from 'js-cookie';

export enum CookieKey {
  AccessToken = 'token',
  RefreshToken = 'refreshToken',
}

export class CookieService {
  static setValue(key: CookieKey, value: string, options?: Cookies.CookieAttributes) {
    Cookies.set(key, value, options);
  }

  static getValue(key: CookieKey) {
    return Cookies.get(key);
  }

  static removeValue(key: CookieKey, options?: Cookies.CookieAttributes) {
    Cookies.remove(key, options);
  }
}
