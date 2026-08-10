import iconLightUrl from '../../icon_light_Mode.png?url';

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
      {
        src: iconLightUrl,
        sizes: 'any',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
