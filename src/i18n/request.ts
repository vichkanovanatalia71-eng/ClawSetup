import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  let locale: Locale = defaultLocale;

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else {
    const headerStore = await headers();
    const acceptLanguage = headerStore.get('accept-language') || '';
    const preferred = acceptLanguage
      .split(',')
      .map((part) => part.split(';')[0].trim().substring(0, 2).toLowerCase())
      .find((lang) => locales.includes(lang as Locale));
    if (preferred) {
      locale = preferred as Locale;
    }
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
