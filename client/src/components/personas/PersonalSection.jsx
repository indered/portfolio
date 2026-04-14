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
          I'm Mahesh, {age} years old, originally from Ayodhya in India.
        </p>

        <p>
          I grew up there and moved to Noida for my engineering degree.
          After college I stayed in the Delhi NCR area and worked as a
          software developer for a few years. Then I got an opportunity
          in Dubai and took it. I've been here since, currently working
          at Emirates NBD.
        </p>

        <p>
          Outside of work I like running, mixing music on DJ decks,
          playing ukulele, making coffee and trying new recipes in
          the kitchen. I'm not great at all of them but I enjoy the process.
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
