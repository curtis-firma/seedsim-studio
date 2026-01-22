import type { ReactNode } from 'react';

export const metadata = {
  title: 'SeedSIM Studio',
  description: 'SeedSIM Studio Application',
};

/**
 * The root layout for the application. This component wraps all pages and sets
 * up the HTML document structure. See https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}