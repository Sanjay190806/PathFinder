
export type LayoutDensity = 'compact' | 'balanced' | 'detailed';

export function getDensityPadding(density: LayoutDensity): string {
  switch (density) {
    case 'compact': return 'p-3 gap-3';
    case 'detailed': return 'p-6 gap-6';
    case 'balanced':
    default:
      return 'p-5 gap-5';
  }
}

export function getGridColumns(breakpoint: string): string {
  switch (breakpoint) {
    case 'xs': return 'grid-cols-1';
    case 'sm': return 'grid-cols-1 sm:grid-cols-2';
    case 'md': return 'grid-cols-2';
    case 'lg': return 'grid-cols-2 lg:grid-cols-3';
    case 'xl': return 'grid-cols-3';
    case '2xl':
    default:
      return 'grid-cols-3 2xl:grid-cols-4';
  }
}
