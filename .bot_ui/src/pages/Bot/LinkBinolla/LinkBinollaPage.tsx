import { useState } from 'react';
import { BinollaPlatformAuth } from './BinollaPlatformAuth';
import type { BinollaAuthMode } from './hooks/useBinollaPlatformAuth';

export default function LinkBinollaPage() {
  const [mode, setMode] = useState<BinollaAuthMode>('login');

  return (
    <BinollaPlatformAuth
      mode={mode}
      onToggleMode={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
    />
  );
}
