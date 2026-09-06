import { useState, useEffect, useRef, RefObject } from 'react';

export interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize<T extends HTMLElement>(): [RefObject<T>, ContainerSize] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
export default useContainerSize;
