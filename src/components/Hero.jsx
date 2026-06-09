export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero__inner">
        <p className="eyebrow hero__eyebrow">Модельное агентство</p>
        <h1 className="hero__title">Аура</h1>
        <p className="hero__subtitle">Профессиональные фотосессии</p>
      </div>

      <a className="hero__scroll" href="#about" aria-label="Листать вниз">
        <span>Листать</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </header>
  );
}
