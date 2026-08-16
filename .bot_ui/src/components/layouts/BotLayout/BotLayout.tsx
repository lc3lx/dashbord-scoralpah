import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BottomNavigation } from '@components/organisms/BottomNavigation';
import type { NavTab } from '@components/types';
import { ROUTES } from '@constants/routes';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import type { RouteHandle } from '@/types/routing';
import styles from './BotLayout.module.css';

const TAB_ROUTES: Record<NavTab, string> = {
  home: ROUTES.home,
  bot: ROUTES.bot,
  trades: ROUTES.history,
  profile: ROUTES.settings,
};

function resolveActiveTab(pathname: string): NavTab | null {
  if (pathname === ROUTES.trading) return null;
  if (pathname === ROUTES.home) return 'home';
  if (pathname === ROUTES.bot) return 'bot';
  if (pathname === ROUTES.history) return 'trades';
  if (pathname.startsWith(ROUTES.settings)) return 'profile';
  return null;
}

function resolveFabState(pathname: string): { fabActive: boolean; fabLabel?: string } {
  if (pathname === ROUTES.trading) {
    return { fabActive: true, fabLabel: t('nav.trading') };
  }

  return { fabActive: false };
}

export function BotLayout() {
  const matches = useMatches();
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const requiresAuth = matches.some(
      (match) => (match.handle as RouteHandle | undefined)?.requiresAuth === true,
    );
    if (requiresAuth && !tokenStore.isAuthenticated()) {
      navigate(ROUTES.login, { replace: true, state: { from: location.pathname } });
      return;
    }
    setReady(true);
  }, [location.pathname, matches, navigate]);

  const showBottomNav = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.showBottomNav === true,
  );

  const activeTab = resolveActiveTab(location.pathname);
  const { fabActive, fabLabel } = resolveFabState(location.pathname);

  const handleTabChange = (tab: NavTab) => {
    navigate(TAB_ROUTES[tab]);
  };

  if (!ready) return null;

  return (
    <section className={styles.layout} aria-label={t('layout.botApp')}>
      <div className={styles.content}>
        <Outlet />
      </div>

      {showBottomNav && (
        <BottomNavigation
          activeTab={activeTab}
          fabActive={fabActive}
          fabLabel={fabLabel}
          onTabChange={handleTabChange}
          onFabClick={() => navigate(ROUTES.trading)}
          className={styles.bottomNav}
        />
      )}
    </section>
  );
}
