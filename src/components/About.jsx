import { ABOUT } from '../data/content';
import Reveal from './Reveal';

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <Reveal className="about__intro">
          <p className="eyebrow">{ABOUT.eyebrow}</p>
          <h2>{ABOUT.title}</h2>
          <p className="about__lead-text">{ABOUT.intro}</p>
        </Reveal>

        <div className="about__grid">
          {ABOUT.blocks.map((block, i) => (
            <Reveal key={block.title} className="about__block" delay={i * 80}>
              <h3>{block.title}</h3>
              <ul className="about__list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="about__apply">
          <p className="about__apply-lead">{ABOUT.apply.lead}</p>
          <p className="about__apply-title">{ABOUT.apply.listTitle}</p>
          <ul className="about__apply-list">
            {ABOUT.apply.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="about__apply-closing">{ABOUT.apply.closing}</p>
        </Reveal>
      </div>
    </section>
  );
}
