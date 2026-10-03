'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  modelAsset,
  modelPoster,
  type DesignConfig,
  type Part,
} from '@/domain/catalog';
export type Capture = (format?: 'image/png' | 'image/webp') => string;
export interface ViewerProps {
  config: DesignConfig;
  selected?: Part;
  onSelect?: (part: Part) => void;
  onCaptureReady?: (capture: Capture | null) => void;
  cameraView?: string;
  zoom?: number;
}
const Canvas = dynamic(() => import('./ShoeCanvas'), {
  ssr: false,
  loading: () => null,
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
        <p>
          3D 상품을 불러오지 못했습니다. 대표 이미지를 확인하거나 다시 시도해
          주세요.
        </p>
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
  const path = modelAsset(props.config);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const loaded = loadedPath === path;
  const forward = props.onCaptureReady;
  useEffect(() => {
    forward?.(null);
    return () => forward?.(null);
  }, [forward, path]);
  const ready = useCallback(
    (capture: Capture | null) => {
      setLoadedPath(capture ? path : null);
      if (capture) setFailedPath(null);
      forward?.(capture);
    },
    [forward, path],
  );
  return (
    <div
      className={`product-viewer ${loaded ? 'is-loaded' : ''}`}
      data-testid="product-viewer"
      data-model={props.config.model}
      data-model-version={props.config.modelVersion}
      data-loaded={loaded}
    >
      <Image
        className="viewer-poster"
        src={modelPoster(props.config)}
        alt={`${props.config.model === 'runner' ? '러너' : '로우탑'} 대표 이미지`}
        fill
        sizes="(max-width: 767px) 100vw, 65vw"
        priority
      />
      {!loaded && failedPath !== path && (
        <span className="viewer-loading" role="status">
          3D 상품을 준비하고 있습니다.
        </span>
      )}
      <ViewerBoundary
        key={path}
        onError={() => {
          setLoadedPath(null);
          setFailedPath(path);
          forward?.(null);
        }}
        onRetry={async () => {
          const viewerModule = await import('./ShoeCanvas');
          viewerModule.clearModelCache(props.config);
          setFailedPath(null);
        }}
      >
        <Canvas key={path} {...props} onCaptureReady={ready} />
      </ViewerBoundary>
    </div>
  );
}
