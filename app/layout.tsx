import { Plus_Jakarta_Sans } from 'next/font/google';
import Layout from '@/components/Layout';
import ThemeScript from '@/components/ThemeScript';

const font = Plus_Jakarta_Sans({
  subsets: ['latin', 'cyrillic-ext', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'AI Nexus Platform',
  description: 'Knowledge management platform for founders — люди, проєкти, ідеї, можливості',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className={font.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}