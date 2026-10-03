import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repository } from '@/server/repository';
import { findProduct, PARTS } from '@/domain/catalog';
export const alt = 'NIJOOW — 공유 디자인의 색상과 각인';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';
export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const design = await repository().shared(token);
  if (!design)
    return new Response('Shared design unavailable', { status: 404 });
  const font = await readFile(
    join(process.cwd(), 'src/fonts/NanumSquareRoundR.ttf'),
  );
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 64,
        background: '#f2f0e9',
        color: '#191918',
        fontFamily: 'Nanum',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 24,
        }}
      >
        <span>NIJOOW / SHARED EDIT</span>
        <span>{findProduct(design.config.model)?.name}</span>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 64,
          lineHeight: 1.15,
          wordBreak: 'break-word',
          maxWidth: 1072,
        }}
      >
        {design.name}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {PARTS.map(part => (
          <div
            key={part.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flex: 1,
            }}
          >
            <div
              style={{
                height: 96,
                background: design.config.colors[part.id],
                border: '1px solid #aaa79e',
              }}
            />
            <span style={{ fontSize: 20 }}>{part.name}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 22,
          borderTop: '1px solid #aaa79e',
          paddingTop: 18,
        }}
      >
        <span>
          {design.config.material.toUpperCase()} /{' '}
          {design.config.engraving || 'NO SIGNATURE'}
        </span>
        <span>DESIGN CONFIGURATION · PORTFOLIO DEMO</span>
      </div>
    </div>,
    {
      ...size,
      headers: { 'Cache-Control': 'private, no-store' },
      fonts: [
        {
          name: 'Nanum',
          data: new Uint8Array(font).buffer,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );
}
