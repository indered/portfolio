import styles from './DatingSection.module.scss';

export default function DatingSection() {
  return (
    <div className={styles.page} role="main">

      <div className={styles.letter}>
        <p>
          Hi. I'm the guy who built this solar system instead of a normal portfolio.
        </p>

        <p>
          I run marathons in 42 degree Dubai heat because something about suffering
          at sunrise makes the rest of the day feel easy. I move money at scale for
          one of the biggest banks in the Middle East, where every dirham has to land
          in the right place at the right time. And somewhere between the running and
          the coding, I decided hydration should taste better, so now I'm building
          that too.
        </p>

        <p>
          I read Guru Nanak and Stephen Hawking in the same sitting. One teaches me
          faith, the other teaches me to question it. I think that's the balance.
        </p>

        <p>
          Ayodhya raised me. Delhi shaped me. Dubai is home. Three cities, three
          versions of me, all still figuring it out.
        </p>

        <p>
          If you scrolled all the way here, I already like you. Most people bounce
          after the solar system. You stayed. That means something.
        </p>

        <p>
          Thanks for visiting. And if you ever want to build something together,
          you know where to find me.
        </p>

        <div className={styles.actions}>
          <a href="mailto:mahesh.inder85@gmail.com" className={styles.cta}>
            Get in touch &rarr;
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
