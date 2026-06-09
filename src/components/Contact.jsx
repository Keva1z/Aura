import { EMAIL, PHONE, PHONE_HREF } from '../data/content';
import RussianFlag from './RussianFlag';
import Reveal from './Reveal';

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <div className="contact__grid">
          <Reveal className="contact__item">
            <p className="label">Почта</p>
            <a className="contact__value" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </Reveal>

          <Reveal className="contact__item" delay={100}>
            <p className="label">Телефон</p>
            <a className="contact__value" href={PHONE_HREF}>
              <RussianFlag className="contact__flag" />
              {PHONE}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
