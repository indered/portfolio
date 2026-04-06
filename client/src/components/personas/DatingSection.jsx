import styles from './DatingSection.module.scss';

export default function DatingSection() {
  return (
    <div className={styles.page} role="main">

      <div className={styles.letter}>
        <p>
          Hi. I'm Mahesh. I built this solar system because a normal portfolio felt boring.
        </p>

        <p>
          I'm a software engineer at Emirates NBD in Dubai. I run long distances here,
          mostly because I like sunrises and quiet mornings. I'm also trying to build
          a hydration brand called Figuring Out, because I think electrolytes should
          taste better than they do.
        </p>

        <p>
          I grew up in Ayodhya, lived in Delhi, and moved to Dubai. Each city taught
          me something different.
        </p>

        <p>
          I started thinking a lot more with age. About faith, about the universe,
          about what matters.
        </p>

        <p>
          If you made it this far, thank you. That means a lot.
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
