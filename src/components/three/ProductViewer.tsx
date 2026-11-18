'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useCallback, useState, type ReactNode } from 'react';
import { modelPoster, type DesignConfig, type Part } from '@/domain/catalog';
export type Capture = (format?: 'image/png' | 'image/webp') => string;
export interface ViewerProps {
  config: DesignConfig;
  selected?: Part;
  onSelect?: (part: Part) => void;
  onCaptureReady?: (capture: Capture) => void;
  cameraView?: string;
  zoom?: number;
}
const Canvas = dynamic(() => import('./ShoeCanvas'), {
  ssr: false,
  loading: () => (
    <span className="viewer-loading" role="status">
      3D를 준비하고 있어.
    </span>
  ),
});
class ViewerBoundary extends Component<
  { children: ReactNode; onError: () => void; onRetry: () => Promise<void> },
  { failed: boolean }
> {
  state = { failed: false };
  componentDidCatch() {
    this.props.onError();
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="viewer-fallback">
        <p>3D를 불러오지 못했어.</p>
        <button
          className="button small outline"
          onClick={() => {
            void this.props
              .onRetry()
              .then(() => this.setState({ failed: false }))
              .catch(() => undefined);
          }}
        >
          다시 시도
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function ProductViewer(props: ViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const forward = props.onCaptureReady;
  const ready = useCallback(
    (capture: Capture) => {
      setLoaded(true);
      forward?.(capture);
    },
    [forward],
  );
  return (
    <div className={`product-viewer ${loaded ? 'is-loaded' : ''}`}>
      <Image
        className="viewer-poster"
        src={modelPoster(props.config)}
        alt={`${props.config.model === 'runner' ? '러너' : '로우탑'} 대표 이미지`}
        fill
        sizes="(max-width: 767px) 100vw, 65vw"
        priority
      />
      <ViewerBoundary
        onError={() => setLoaded(false)}
        onRetry={async () => {
          const viewerModule = await import('./ShoeCanvas');
          viewerModule.clearModelCache(props.config);
        }}
      >
        <Canvas {...props} onCaptureReady={ready} />
      </ViewerBoundary>
    </div>
  );
}
