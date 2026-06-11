import { useRef, useState, useEffect } from 'react';
import { MODELS } from '../data/content';

// На телефоне видно 1 фото (крупно), на десктопе — 3. Брейкпоинт совпадает с CSS.
const MOBILE_MQ = '(max-width: 700px)';
const visibleFor = () => (window.matchMedia(MOBILE_MQ).matches ? 1 : 3);

/**
 * Карусель на CSS-transform (без нативного скролла — работает во всех браузерах).
 * Окно из `visible` фото сдвигается по одному. Точек = MODELS.length - visible + 1
 * (телефон: 6 точек по 1 фото; десктоп: 4 точки по 3 фото). На телефоне стрелки
 * скрыты (CSS), листание — свайпом.
 */
export default function Gallery() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [visible, setVisible] = useState(visibleFor);
  const [active, setActive] = useState(0);
  const [offset, setOffset] = useState(0);

  const steps = Math.max(1, MODELS.length - visible + 1);
  const current = Math.min(active, steps - 1); // безопасный индекс при смене брейкпоинта

  const go = (pos) => setActive(Math.max(0, Math.min(steps - 1, pos)));

  // Следим за сменой брейкпоинта (1 фото / 3 фото).
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => setVisible(mq.matches ? 1 : 3);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Сдвигаем трек так, чтобы первый слайд окна встал к левому краю.
  useEffect(() => {
    const compute = () => {
      const track = trackRef.current;
      if (!track || !track.children[current]) return;
      setOffset(-track.children[current].offsetLeft);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [current, visible]);

  // Свайп пальцем / мышью.
  const dragX = useRef(null);
  const onPointerDown = (e) => {
    dragX.current = e.clientX;
  };
  const onPointerUp = (e) => {
    if (dragX.current == null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (dx <= -40) go(current + 1);
    else if (dx >= 40) go(current - 1);
  };

  return (
    <section className="section gallery" id="models">
      <div className="container gallery__head">
        <p className="eyebrow">Портфолио</p>
        <h2>Наши модели</h2>
      </div>

      <div
        className="gallery__viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragX.current = null)}
      >
        <div
          className="gallery__track"
          ref={trackRef}
          style={{ transform: `translate3d(${offset}px, 0, 0)` }}
        >
          {MODELS.map((model, i) => (
            <figure className="gallery__slide" key={model.src} data-index={i + 1}>
              <img
                src={model.src}
                srcSet={`${model.src.replace(/\.jpg$/, '-sm.jpg')} 640w, ${model.src} 840w`}
                sizes="(max-width: 700px) 88vw, 380px"
                alt={model.alt}
                loading="lazy"
                decoding="async"
                draggable="false"
                onError={(e) => e.currentTarget.classList.add('is-broken')}
              />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="gallery__btn gallery__btn--prev"
          onClick={() => go(current - 1)}
          aria-label="Предыдущие фото"
          disabled={current === 0}
        >
          ‹
        </button>
        <button
          type="button"
          className="gallery__btn gallery__btn--next"
          onClick={() => go(current + 1)}
          aria-label="Следующие фото"
          disabled={current === steps - 1}
        >
          ›
        </button>
      </div>

      <div className="gallery__dots" role="group" aria-label="Навигация по фото">
        {Array.from({ length: steps }, (_, i) => (
          <button
            type="button"
            key={i}
            className={`gallery__dot ${current === i ? 'is-active' : ''}`}
            onClick={() => go(i)}
            aria-label={visible === 1 ? `Перейти к фото ${i + 1}` : `Показать фото ${i + 1}–${i + visible}`}
            aria-current={current === i}
          />
        ))}
      </div>
    </section>
  );
}
