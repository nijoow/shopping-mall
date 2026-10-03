'use client';
import { SERVICE_COPY } from '@/content/copy';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Heart, RotateCcw } from 'lucide-react';
import { money, PRESETS, presetConfig, type Product } from '@/domain/catalog';
import ProductViewer from '@/components/three/ProductViewer';
import { useDemo } from './DemoProvider';
import { useRouter } from 'next/navigation';

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter(),
    { state, mutate, notify } = useDemo();
  const [size, setSize] = useState(
      product.sizes.length === 1 ? product.sizes[0] : '',
    ),
    [preset, setPreset] = useState('original'),
    [photo, setPhoto] = useState(!product.model),
    [view, setView] = useState('front'),
    [zoom, setZoom] = useState(1.2),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const sizeRef = useRef<HTMLDivElement>(null);
  const config = product.model ? presetConfig(product.model, preset) : null;
  const favorite = state?.favorites.includes(product.id) ?? false;
  async function add(buy = false) {
    if (!size) {
      setError(SERVICE_COPY.sizeRequired);
      sizeRef.current?.querySelector('button')?.focus();
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = await mutate<{ lineId: string }>('cart.add', {
        productId: product.id,
        size,
        quantity: 1,
        config,
      });
      if (buy) router.push(`/checkout?items=${result.lineId}`);
      else notify(SERVICE_COPY.addedToCart);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="page-shell product-page">
      <div className="breadcrumbs">
        <Link href="/shop/all">SHOP</Link>
        <span>/</span>
        <Link href={`/shop/${product.category}`}>
          {product.category.toUpperCase()}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail-grid">
        <div className="product-media-column">
          <div className="product-stage">
            {config && !photo ? (
              <ProductViewer config={config} cameraView={view} zoom={zoom} />
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 60vw"
              />
            )}
            <span className="stage-index">
              01 — {photo ? 'PRODUCT VIEW' : 'INTERACTIVE 3D'}
            </span>
          </div>
          {product.model && (
            <div className="media-toolbar">
              <button aria-pressed={!photo} onClick={() => setPhoto(false)}>
                3D VIEW
              </button>
              <button aria-pressed={photo} onClick={() => setPhoto(true)}>
                PHOTO
              </button>
              <span />
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
              <button
                onClick={() => {
                  setPhoto(false);
                  setView('side');
                }}
              >
                측면
              </button>
              <button
                onClick={() => {
                  setPhoto(false);
                  setView('heel');
                }}
              >
                후면
              </button>
              <button
                onClick={() => {
                  setPhoto(false);
                  setView('front');
                }}
                aria-label="기본 시점"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          )}
          <p className="media-help">
            {product.model
              ? '드래그하면 모델을 회전할 수 있습니다. 디자인 스튜디오에서 색상·재질·각인을 편집해 보세요.'
              : '상품 이미지와 옵션을 확인하고 주문 과정을 체험해 보세요.'}
          </p>
        </div>
        <aside className="product-information">
          <div className="product-title-row">
            <span className="eyebrow">THE NIJOOW COLLECTION</span>
            <button
              className="icon-button"
              disabled={!state}
              aria-label={favorite ? '찜 해제' : '찜하기'}
              aria-pressed={favorite}
              onClick={async () => {
                try {
                  await mutate('favorite', product.id);
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <h1>{product.name}</h1>
          <p className="product-subtitle">{product.subtitle}</p>
          <div className="product-price">{money(product.price)}</div>
          <p className="product-description">{product.description}</p>
          {config && (
            <div className="option-section">
              <span className="eyebrow">COLORWAY — {preset.toUpperCase()}</span>
              <div className="preset-options">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    aria-pressed={preset === p.id}
                  >
                    <i style={{ background: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="option-section" ref={sizeRef}>
            <span className="eyebrow">SIZE</span>
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
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <div className="purchase-actions">
            {product.model && (
              <Link
                className="button"
                href={`/studio/${product.model}?preset=${preset}${size ? `&size=${size}` : ''}`}
              >
                내 디자인으로 만들기 <ArrowUpRight size={19} />
              </Link>
            )}
            <div>
              <button
                className={`button ${product.model ? 'outline' : ''}`}
                disabled={pending || !state}
                onClick={() => void add(true)}
              >
                바로 주문하기
              </button>
              <button
                className="button outline"
                disabled={pending || !state}
                onClick={() => void add()}
              >
                장바구니 담기
              </button>
            </div>
          </div>
          <p className="demo-caption">{SERVICE_COPY.demoNotice}</p>
          <div className="product-accordions">
            <details>
              <summary>제품 안내</summary>
              <p>{product.composition}</p>
            </details>
            <details>
              <summary>사이즈 가이드</summary>
              <p>
                {product.model
                  ? '사이즈는 mm 단위의 체험용 옵션입니다. 실제 착화나 발 크기 측정은 제공하지 않습니다.'
                  : '표시된 사이즈는 체험용 옵션입니다. ONE SIZE 상품은 별도 사이즈 선택 없이 담을 수 있습니다.'}
              </p>
            </details>
            <details>
              <summary>배송 · 취소 · 반품 체험</summary>
              <p>
                모의 주문에는 상품 금액 15만원 미만일 때 가상 배송비 3,000원이
                적용됩니다. 주문 상세에서 배송 단계를 진행하고 출고 전 취소·배송
                완료 후 반품을 체험할 수 있습니다.
              </p>
            </details>
          </div>
        </aside>
      </div>
      <section className="product-story">
        <div>
          <span className="eyebrow">DETAILS MAKE THE DIFFERENCE</span>
          <h2>
            가까이 볼수록,
            <br />
            새로운 디테일.
          </h2>
          <p>{product.description}</p>
        </div>
        <div className="product-story-image">
          <Image
            src={product.detail}
            alt={`${product.name} 디테일`}
            fill
            sizes="60vw"
          />
        </div>
      </section>
    </div>
  );
}
