import { useMemo } from 'react';
import styles from './PersonalSection.module.scss';

function getAge() {
  const birth = new Date(1997, 3, 19); // April 19, 1997
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function DatingSection() {
  const age = useMemo(() => getAge(), []);

  return (
    <div className={styles.page} role="main">

      <div className={styles.letter}>
        <p className={styles.intro}>
          Mahesh, {age}, from a small town called Ayodhya in India.
        </p>

        <p>
          Grew up there, did my engineering in Noida, and landed my first
          job writing code. Life was moving along fine until Covid decided
          to shut the world down. So I went back home and spent the next
          couple of years freelancing from my old bedroom, building things
          for Tokopedia and a few US fintech startups. My mom thought I was
          unemployed the entire time.
        </p>

        <p>
          Eventually a girl broke my heart and I needed a change of
          scenery. Preferably 2,700 km worth of it. Moved to Dubai, fell
          in love with the city instead, and never looked back. Now I build
          software at Emirates NBD during the day and train for a full
          marathon at 5am because heartbreak has to go somewhere.
        </p>

        <p>
          On weekends you'll find me behind DJ decks playing to an empty
          room, learning ukulele at a painfully slow pace, making coffee
          nobody asked for, or cooking something that could go either way.
          It's a good life.
        </p>

        <div className={styles.actions}>
          <a href="mailto:mahesh.inder85@gmail.com" className={styles.cta}>
            Say hello &rarr;
          </a>
          <a
            href="https://www.instagram.com/mahesh.inder_/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.igLink}
          >
            @mahesh.inder_
          </a>
        </div>
      </div>

    </div>
  );
}
