'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  RotateCcw,
  Undo2,
  Redo2,
  Share2,
} from 'lucide-react';
import {
  defaultConfig,
  modelPoster,
  findProduct,
  MATERIALS,
  money,
  PARTS,
  PALETTE,
  PRESETS,
  presetConfig,
  unitPrice,
  type DesignConfig,
  type ModelId,
  type Part,
} from '@/domain/catalog';
import { configKey, configSchema } from '@/domain/validation';
import type { SavedDesign, CartLine } from '@/domain/types';
import ProductViewer, { type Capture } from '@/components/three/ProductViewer';
import { useDemo } from './DemoProvider';
import { DataGuard, EmptyState } from './StateView';

interface Draft {
  id: string;
  name: string;
  config: DesignConfig;
  version: number;
}
export function Studio({
  model,
  shared,
}: {
  model: ModelId;
  shared?: Pick<SavedDesign, 'name' | 'config'>;
}) {
  const { state } = useDemo(),
    params = useSearchParams();
  const designId = params.get('design'),
    cartId = params.get('cart');
  if (!state)
    return (
      <DataGuard>
        <></>
      </DataGuard>
    );
  const existing = designId
    ? state.designs.find(d => d.id === designId)
    : undefined;
  if (designId && (!existing || existing.config.model !== model))
    return (
      <EmptyState
        title="디자인을 찾을 수 없어."
        text="삭제됐거나 현재 계정에서 열 수 없는 디자인이야."
        href={`/studio/${model}`}
        action="새 디자인 만들기"
      />
    );
  const cartLine = cartId
    ? state.cart.find(line => line.id === cartId && line.productId === model)
    : undefined;
  if (cartId && !cartLine)
    return (
      <EmptyState
        title="수정할 구성을 찾을 수 없어."
        text="장바구니 항목이 변경되었거나 주문됐어."
        href="/cart"
        action="장바구니 확인"
      />
    );
  return (
    <StudioEditor
      key={`${state.workspaceId}:${designId ?? cartId ?? params.get('source') ?? model}`}
      model={model}
      cartLine={cartLine}
      initial={existing}
      shared={shared}
      preset={params.get('preset') ?? 'original'}
      initialSize={params.get('size') ?? ''}
      workspaceId={state.workspaceId}
    />
  );
}
function StudioEditor({
  model,
  initial,
  shared,
  preset,
  initialSize,
  workspaceId,
  cartLine,
}: {
  model: ModelId;
  initial?: SavedDesign;
  shared?: Pick<SavedDesign, 'name' | 'config'>;
  preset: string;
  initialSize: string;
  workspaceId: string;
  cartLine?: CartLine;
}) {
  const router = useRouter(),
    { mutate, notify } = useDemo();
  const product = findProduct(model)!;
  const [draft] = useState<Draft>(() => {
    if (initial)
      return {
        id: initial.id,
        name: initial.name,
        config: initial.config,
        version: initial.version,
      };
    if (cartLine?.config)
      return {
        id: crypto.randomUUID(),
        name: `${product.name} — CART EDIT`,
        config: cartLine.config,
        version: 0,
      };
    const fallback = {
      id: crypto.randomUUID(),
      name: shared?.name
        ? `${shared.name.slice(0, 34)} 사본`
        : `${product.name} — MY EDIT`,
      config: shared?.config ?? presetConfig(model, preset),
      version: 0,
    };
    if (shared) return fallback;
    try {
      const raw = JSON.parse(
        localStorage.getItem(`nijoow:draft:${workspaceId}:${model}`) ?? 'null',
      );
      if (
        raw?.config &&
        configSchema.safeParse(raw.config).success &&
        raw.config.model === model
      )
        return {
          id: raw.id,
          name: raw.name,
          config: raw.config,
          version: raw.version ?? 0,
        };
    } catch {}
    return fallback;
  });
  const [config, setConfig] = useState(draft.config),
    [name, setName] = useState(draft.name),
    [part, setPart] = useState<Part>('upper'),
    [size, setSize] = useState(
      cartLine?.size ??
        (product.sizes.includes(initialSize) ? initialSize : ''),
    ),
    [cameraView, setCameraView] = useState('front'),
    [zoom, setZoom] = useState(1.2),
    [compare, setCompare] = useState(false),
    [saving, setSaving] = useState('저장 준비'),
    [renderReady, setRenderReady] = useState(false),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [past, setPast] = useState<DesignConfig[]>([]),
    [future, setFuture] = useState<DesignConfig[]>([]),
    [review, setReview] = useState(false),
    [shareUrl, setShareUrl] = useState('');
  const capture = useRef<Capture | null>(null),
    latest = useRef<Draft>(draft),
    saved = useRef<SavedDesign | null>(initial ?? null),
    savedKey = useRef(
      initial ? `${initial.name}:${configKey(initial.config)}` : '',
    ),
    queue = useRef<Promise<SavedDesign | null>>(
      Promise.resolve(initial ?? null),
    );
  const captureReady = useCallback((fn: Capture) => {
    capture.current = fn;
    setRenderReady(true);
  }, []);
  const save = useCallback(() => {
    const task = async () => {
      const current = latest.current,
        key = `${current.name}:${configKey(current.config)}`;
      if (savedKey.current === key && saved.current?.preview)
        return saved.current;
      setSaving('저장 중');
      setError('');
      let preview: string | null = null;
      try {
        preview = capture.current?.() ?? null;
      } catch {}
      try {
        const result = await mutate<SavedDesign>('design.save', {
          ...current,
          preview,
        });
        latest.current = { ...latest.current, version: result.version };
        saved.current = result;
        savedKey.current = key;
        try {
          localStorage.setItem(
            `nijoow:draft:${workspaceId}:${model}`,
            JSON.stringify(latest.current),
          );
        } catch {}
        setSaving('저장됨');
        return result;
      } catch (e) {
        setSaving('저장 실패');
        setError((e as Error).message);
        throw e;
      }
    };
    queue.current = queue.current.catch(() => null).then(task);
    return queue.current;
  }, [mutate, model, workspaceId]);
  useEffect(() => {
    try {
      localStorage.setItem(
        `nijoow:draft:${workspaceId}:${model}`,
        JSON.stringify(latest.current),
      );
    } catch {}
    const timer = setTimeout(() => {
      void save().catch(() => undefined);
    }, 1100);
    return () => clearTimeout(timer);
  }, [config, name, save, model, workspaceId, renderReady]);
  function change(next: DesignConfig) {
    setPast(p => [...p.slice(-29), config]);
    setFuture([]);
    setConfig(next);
    latest.current = { ...latest.current, config: next };
    setCompare(false);
  }
  function undo() {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setFuture(f => [config, ...f]);
    setPast(p => p.slice(0, -1));
    setConfig(previous);
    latest.current = { ...latest.current, config: previous };
  }
  function redo() {
    if (!future.length) return;
    const next = future[0];
    setPast(p => [...p, config]);
    setFuture(f => f.slice(1));
    setConfig(next);
    latest.current = { ...latest.current, config: next };
  }
  async function purchase(buy: boolean) {
    if (!size) {
      setError('주문할 사이즈를 선택해줘.');
      setReview(true);
      return;
    }
    setPending(true);
    setError('');
    try {
      await save();
      let preview: string | null = null;
      try {
        preview = capture.current?.() ?? null;
      } catch {}
      const result = cartLine
        ? await mutate<{ lineId: string }>('cart.replace', {
            id: cartLine.id,
            changes: { size, config: latest.current.config, preview },
          })
        : await mutate<{ lineId: string }>('cart.add', {
            productId: model,
            size,
            quantity: 1,
            config: latest.current.config,
            preview,
          });
      notify(
        cartLine
          ? '장바구니 디자인을 수정했어.'
          : '내 디자인을 장바구니에 담았어.',
      );
      router.push(buy ? `/checkout?items=${result.lineId}` : '/cart');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function share() {
    try {
      const design = await save();
      if (!design) return;
      const { token } = await mutate<{ token: string }>(
        'design.share',
        design.id,
      );
      const url = `${location.origin}/share/${token}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        notify('공유 링크를 복사했어.');
      } catch {
        notify('아래 공유 링크를 복사해줘.');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function download() {
    try {
      if (!capture.current) {
        notify('3D 로딩이 끝나면 저장할 수 있어.');
        return;
      }
      const link = document.createElement('a');
      link.href = capture.current('image/png');
      link.download = `nijoow-${model}-design.png`;
      link.click();
    } catch {
      setError('이미지를 저장하지 못했어. 3D를 다시 불러온 뒤 시도해줘.');
    }
  }
  return (
    <div className="studio">
      <header className="studio-header">
        <Link className="studio-back" href={`/product/${model}`}>
          <ArrowLeft size={18} />
          <span>상품으로</span>
        </Link>
        <Link className="wordmark" href="/">
          NIJOOW
        </Link>
        <span className="studio-header-label">YOUR PERSONAL EDIT</span>
        <div className="studio-top-actions">
          <span className="save-status" role="status">
            {saving === '저장됨' && <Check size={13} />} {saving}
          </span>
          <button
            className="icon-button"
            aria-label="실행 취소"
            disabled={!past.length || pending}
            onClick={undo}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="다시 실행"
            disabled={!future.length || pending}
            onClick={redo}
          >
            <Redo2 size={18} />
          </button>
          <Link href="/designs" className="text-link">
            내 디자인
          </Link>
        </div>
      </header>
      <div className="studio-body">
        <section className="studio-stage" aria-label="3D 디자인 미리보기">
          <div className="studio-stage-title">
            <span className="eyebrow">01 — YOUR DESIGN STUDIO</span>
            <h1>{product.name}</h1>
            <p>작은 선택이 만드는 나만의 조합.</p>
          </div>
          <ProductViewer
            config={config}
            selected={part}
            onSelect={setPart}
            onCaptureReady={captureReady}
            cameraView={cameraView}
            zoom={zoom}
          />
          {compare && (
            <div className="studio-compare-image">
              <Image
                src={modelPoster(config)}
                alt="원본 디자인 비교"
                fill
                sizes="70vw"
              />
            </div>
          )}
          <div className="studio-view-controls">
            {[
              ['front', '전체'],
              ['side', '측면'],
              ['heel', '후면'],
              ['sole', '밑창'],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={cameraView === id}
                onClick={() => setCameraView(id)}
              >
                {label}
              </button>
            ))}
            <button
              aria-label="축소"
              disabled={zoom <= 0.8}
              onClick={() => setZoom(z => Math.max(0.8, z - 0.15))}
            >
              −
            </button>
            <button
              aria-label="확대"
              disabled={zoom >= 1.65}
              onClick={() => setZoom(z => Math.min(1.65, z + 0.15))}
            >
              +
            </button>
            <span />
            <button aria-pressed={compare} onClick={() => setCompare(v => !v)}>
              원본 비교
            </button>
            <button
              aria-label="색상 초기화"
              onClick={() => change(defaultConfig(model))}
            >
              <RotateCcw size={15} />
            </button>
          </div>
          <span className="studio-drag-hint">
            DRAG TO ROTATE · 부위를 클릭해 선택해봐
          </span>
        </section>
        <aside className="studio-panel">
          <div className="studio-panel-tabs">
            <button aria-pressed={!review} onClick={() => setReview(false)}>
              01 디자인
            </button>
            <button aria-pressed={review} onClick={() => setReview(true)}>
              02 사이즈 · 주문
            </button>
          </div>
          <div className="studio-panel-content">
            <label className="design-name-label">
              디자인 이름
              <input
                maxLength={40}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  latest.current = { ...latest.current, name: e.target.value };
                }}
              />
            </label>
            {!review ? (
              <fieldset className="studio-options" disabled={pending}>
                <div className="option-section">
                  <span className="eyebrow">START WITH A COLORWAY</span>
                  <div className="studio-presets">
                    {PRESETS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => change(presetConfig(model, p.id))}
                      >
                        <i style={{ background: p.color }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="option-section">
                  <span className="eyebrow">SELECT A PART</span>
                  <div className="part-options">
                    {PARTS.map(p => (
                      <button
                        key={p.id}
                        aria-pressed={part === p.id}
                        onClick={() => setPart(p.id)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="option-section">
                  <div className="option-title">
                    <span className="eyebrow">
                      COLOR — {PARTS.find(p => p.id === part)?.name}
                    </span>
                    <span>{config.colors[part].toUpperCase()}</span>
                  </div>
                  <div className="color-palette">
                    {PALETTE.map(p => (
                      <button
                        key={p.color}
                        title={p.name}
                        aria-label={`${p.name} 색상`}
                        aria-pressed={config.colors[part] === p.color}
                        style={{ background: p.color }}
                        onClick={() =>
                          change({
                            ...config,
                            colors: { ...config.colors, [part]: p.color },
                          })
                        }
                      >
                        {config.colors[part] === p.color && <Check size={15} />}
                      </button>
                    ))}
                    <label className="custom-color" title="직접 색상 선택">
                      <input
                        type="color"
                        aria-label="직접 색상 선택"
                        value={config.colors[part]}
                        onChange={e =>
                          change({
                            ...config,
                            colors: {
                              ...config.colors,
                              [part]: e.target.value,
                            },
                          })
                        }
                      />
                      <span>+</span>
                    </label>
                  </div>
                </div>
                <div className="option-section">
                  <span className="eyebrow">UPPER MATERIAL</span>
                  <div className="material-options">
                    {MATERIALS.map(m => (
                      <button
                        key={m.id}
                        aria-pressed={config.material === m.id}
                        onClick={() => change({ ...config, material: m.id })}
                      >
                        <span className={`material-sample ${m.id}`} />
                        <span>
                          <strong>{m.name}</strong>
                          <small>{m.description}</small>
                        </span>
                        {config.material === m.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="option-section">
                  <label className="eyebrow" htmlFor="engraving">
                    YOUR SIGNATURE
                  </label>
                  <input
                    id="engraving"
                    maxLength={8}
                    placeholder="NIJOOW"
                    value={config.engraving}
                    onChange={e =>
                      change({
                        ...config,
                        engraving: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9 ]/g, ''),
                      })
                    }
                  />
                  <p className="option-help">
                    영문·숫자·공백 최대 8자 · 각인 +₩5,000
                  </p>
                </div>
              </fieldset>
            ) : (
              <div className="studio-review">
                <h2>나의 조합을 확인해봐.</h2>
                <div className="configuration-list">
                  {PARTS.map(p => (
                    <div key={p.id}>
                      <span>{p.name}</span>
                      <i style={{ background: config.colors[p.id] }} />
                      <span>{config.colors[p.id]}</span>
                    </div>
                  ))}
                  <div>
                    <span>어퍼 재질</span>
                    <strong>
                      {MATERIALS.find(m => m.id === config.material)?.name}
                    </strong>
                  </div>
                  {config.engraving && (
                    <div>
                      <span>각인</span>
                      <strong>{config.engraving}</strong>
                    </div>
                  )}
                </div>
                <div className="option-section">
                  <span className="eyebrow">SIZE — MM</span>
                  <div className="size-options">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        aria-pressed={size === s}
                        onClick={() => {
                          setSize(s);
                          setError('');
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="notice-box">
                  이 디자인은 데모 주문에 그대로 저장돼. 이후 디자인을 수정해도
                  주문 당시 구성은 유지돼.
                </p>
              </div>
            )}
            {error && (
              <div className="studio-error" role="alert">
                <p>{error}</p>
                <button
                  className="text-link"
                  onClick={() => void save().catch(() => undefined)}
                >
                  저장 다시 시도
                </button>
                {error.includes('사본') && (
                  <button
                    className="text-link"
                    onClick={() => {
                      latest.current = {
                        ...latest.current,
                        id: crypto.randomUUID(),
                        version: 0,
                      };
                      savedKey.current = '';
                      void save().catch(() => undefined);
                    }}
                  >
                    사본으로 저장
                  </button>
                )}
              </div>
            )}
            <div className="studio-secondary-actions">
              <button onClick={download} aria-label="PNG 이미지 저장">
                <Download size={15} />
                이미지 저장
              </button>
              <button onClick={() => void share()}>
                <Share2 size={15} />
                공유
              </button>
            </div>
            {shareUrl && (
              <label className="share-url">
                공유 링크 · 7일간 유효
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={e => e.currentTarget.select()}
                />
              </label>
            )}
          </div>
          <div className="studio-purchase">
            <div>
              <span className="eyebrow">YOUR DESIGN TOTAL</span>
              <strong>{money(unitPrice(product, config))}</strong>
            </div>
            {review ? (
              <div className="studio-purchase-buttons">
                <button
                  className="button outline"
                  disabled={pending}
                  onClick={() => void purchase(false)}
                >
                  {cartLine ? '장바구니 적용' : '담기'}
                </button>
                <button
                  className="button"
                  disabled={pending}
                  onClick={() => void purchase(true)}
                >
                  {pending ? '저장하고 있어…' : '이 디자인 주문하기'}
                  <ArrowUpRight size={17} />
                </button>
              </div>
            ) : (
              <button className="button" onClick={() => setReview(true)}>
                사이즈 · 주문 검토 <ArrowUpRight size={17} />
              </button>
            )}
            <p>실제 청구 없는 포트폴리오 데모</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
