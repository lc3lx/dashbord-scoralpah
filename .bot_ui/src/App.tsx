import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@router/index';
import { useI18n } from '@shared/i18n';

function App() {
  const { locale } = useI18n();

  return (
    <Suspense fallback={null}>
      {/* Remount routes on locale change so service-built copy refreshes. */}
      <RouterProvider key={locale} router={router} />
    </Suspense>
  );
}

export default App;
