import styles from './AuthLegalFooter.module.css';

export type AuthLegalFooterProps = {
  prefix: string;
  linkLabel: string;
  suffix: string;
  href: string;
};

export function AuthLegalFooter({ prefix, linkLabel, suffix, href }: AuthLegalFooterProps) {
  return (
    <p className={styles.footer}>
      <span>{prefix}</span>
      <a className={styles.link} href={href} target="_blank" rel="noreferrer">
        {linkLabel}
      </a>
      <span>{suffix}</span>
    </p>
  );
}
