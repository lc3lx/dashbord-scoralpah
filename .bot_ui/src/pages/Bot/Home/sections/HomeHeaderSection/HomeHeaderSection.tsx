import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { HomeHeader } from '@components/organisms/HomeHeader';
import { ROUTES } from '@constants/routes';
import { useNavigate } from 'react-router-dom';
import type { HomeHeaderContent } from '../../types';
import styles from './HomeHeaderSection.module.css';

export type HomeHeaderSectionProps = {
  content: HomeHeaderContent;
};

export function HomeHeaderSection({ content }: HomeHeaderSectionProps) {
  const navigate = useNavigate();
  const notificationAction = content.notificationAction;

  return (
    <HomeHeader
      title={content.title}
      subtitle={content.subtitle}
      className={styles.section}
      action={
        notificationAction ? (
          <Button
            variant="icon"
            className={styles.notificationButton}
            aria-label={notificationAction.ariaLabel}
            onClick={() => navigate(ROUTES.notifications)}
          >
            <Icon src={notificationAction.iconSrc} size="notification" decorative />
          </Button>
        ) : undefined
      }
    />
  );
}
