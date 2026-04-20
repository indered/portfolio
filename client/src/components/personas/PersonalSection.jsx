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
          Ayodhya is a city of ghats and temples that once lit 2.2 million
          oil lamps on a single night and broke a world record doing it. I
          grew up watching that river and those lights. It's the kind of
          place that stays with you no matter where you end up.
        </p>

        <p>
          I got into computers because of a school teacher who somehow made
          C++ the best hour of the day. That one class is the reason I
          picked computer science in college and moved to Noida for my
          engineering degree. First job came right after, writing code.
          Looking back, that teacher has no idea how much he changed the
          trajectory of my life.
        </p>

        <p>
          Life was going fine until Covid shut the world down. I went back
          home to Ayodhya and spent the next couple of years freelancing
          from my old bedroom. I built things for Tokopedia, an Indonesian
          marketplace, and a couple of US fintech startups. Decent work,
          good clients, real projects. My mom thought I was unemployed the
          entire time.
        </p>

        <p>
          After freelancing I wanted to see what I could do outside of
          India. Not to leave it behind, just to carry it somewhere new. I
          picked Dubai because no other city in the world looks like it.
          The infrastructure is unreal, you have the tallest building on
          the planet just sitting there on your daily commute, and the best
          part is half the city is Indian anyway. I get to live in a
          different country without ever feeling too far from home. I
          joined Emirates NBD and started building software for one of the
          biggest banks in the region.
        </p>

        <p>
          I spent my first year in Dubai trying every club and rooftop the
          city had to offer. Then one morning I woke up early, went for a
          run, and realized I liked that more than any afterparty. Now I am
          training for a full marathon and my weekends start at 5am instead
          of 2am.
        </p>

        <p>
          On weekends I DJ, play ukulele, make coffee, and cook. I am not
          great at all of them but that's never stopped me. Life is good.
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            @mahesh.inder_
          </a>
        </div>
      </div>

    </div>
  );
}
