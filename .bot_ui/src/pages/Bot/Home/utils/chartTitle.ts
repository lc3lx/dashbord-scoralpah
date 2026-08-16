import type { ChartSheetContent } from '../types';

type ResolveChartTitleParams = {
  template: ChartSheetContent['titleTemplate'];
  pairLabel: string;
  durationLabel: string;
};

export function resolveChartSheetTitle({
  template,
  pairLabel,
  durationLabel,
}: ResolveChartTitleParams): string {
  return template.replace('{pair}', pairLabel).replace('{duration}', durationLabel);
}
