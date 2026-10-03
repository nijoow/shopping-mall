import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
export const alt = 'NIJOOW — Your personal sneaker edit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image() {
  const font = await readFile(
    join(process.cwd(), 'src/fonts/Anton-Regular.ttf'),
  );
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#eeece5',
        color: '#1b1d1b',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 72px',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, letterSpacing: 6 }}>
        NIJOOW / THE EDIT
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 105,
          fontWeight: 400,
          fontFamily: 'Anton',
          lineHeight: 1.0,
          letterSpacing: -6,
        }}
      >
        <div>SNEAKER</div>
        <div style={{ display: 'flex' }}>
          YOUR WAY<span style={{ color: '#b82c25' }}>.</span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          borderTop: '2px solid #1b1d1b',
          paddingTop: 22,
          fontSize: 22,
          justifyContent: 'space-between',
        }}
      >
        <span>3D DESIGN / SAVE / SHARE</span>
        <span>PORTFOLIO DEMO</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Anton',
          data: new Uint8Array(font).buffer,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );
}
