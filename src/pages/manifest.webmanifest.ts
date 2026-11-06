import icon192Url from '../assets/brand/icon-192.png?url';
import icon512Url from '../assets/brand/icon-512.png?url';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify({
    name: 'School Pulse',
    short_name: 'School Pulse',
    description: 'School management platform by Victorbee Technologies',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#05080d',
    theme_color: '#05080d',
    icons: [
      { src: icon192Url, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: icon512Url, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
