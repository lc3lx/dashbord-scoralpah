import { useCallback, useState } from 'react';
import type { HomeSheetId } from '../types';

export function useHomeSheets() {
  const [activeSheet, setActiveSheet] = useState<HomeSheetId | null>(null);

  const openSheet = useCallback((sheet: HomeSheetId) => {
    setActiveSheet(sheet);
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
  }, []);

  return {
    activeSheet,
    isOpen: activeSheet !== null,
    openSheet,
    closeSheet,
  };
}

export type UseHomeSheetsReturn = ReturnType<typeof useHomeSheets>;
