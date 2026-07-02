import React from 'react';
import './About.css';

const About = () => (
  <main className="about">
    <section className="about__hero" aria-labelledby="about-title">
      <h1 id="about-title">Rooted in Tawy,<br />the Two Lands</h1>
    </section>

    <section className="about__story" aria-label="Tawy story">
      <p className="about__quote">
        "Tawy" - the ancient name for united Egypt, the meeting of two lands.
      </p>

      <div className="about__copy">
        <p>
          We make clothing the way the old craftspeople did: slowly, by hand, with reverence
          for the line. Each season we return to the temple walls, the tomb paintings, the
          carved folds of a queen's gown, and we ask how that beauty wants to live on a body
          today.
        </p>
        <p>
          The result is heritage you can wear - linen cut for Red Sea heat, drapes that move
          like the Nile, a palette pulled straight from pigment that has held its color for three
          thousand years.
        </p>
      </div>

     
    </section>
  </main>
);

export default About;