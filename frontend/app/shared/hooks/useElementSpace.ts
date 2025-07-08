'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import * as ReactUse from 'react-use';

export interface ElementSpace {
  height: number;
  width: number;
}

const useMeasure = ReactUse.useMeasure;
/**
 * Track the space taken in the viewport by an element (including padding, margin, etc.)
 * @returns [ref, elementSpace]
 */
export function useElementSpace<E extends HTMLElement = HTMLElement>(onViewChange?: (space: ElementSpace) => void) {
  const ref = useRef<E>(null);
  const [measureRef, { height, width }] = useMeasure<E>();

  const [elementSpace, setElementSpace] = useState<ElementSpace>({
    height: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    onViewChange?.(elementSpace);
  }, [elementSpace, onViewChange]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    measureRef(ref.current);
  }, [ref, measureRef]);

  useLayoutEffect(() => {
    if (!ref.current || !height || !width) {
      setElementSpace({ height: 0, width: 0 });
      return;
    }

    const computedStyle = window.getComputedStyle(ref.current);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) ?? 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) ?? 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) ?? 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) ?? 0;
    const marginTop = parseFloat(computedStyle.marginTop) ?? 0;
    const marginBottom = parseFloat(computedStyle.marginBottom) ?? 0;
    const marginLeft = parseFloat(computedStyle.marginLeft) ?? 0;
    const marginRight = parseFloat(computedStyle.marginRight) ?? 0;

    const calculatedSpace = {
      height: height + marginTop + marginBottom + paddingTop + paddingBottom,
      width: width + marginLeft + marginRight + paddingLeft + paddingRight,
    };

    setElementSpace(calculatedSpace);
  }, [measureRef, ref, height, width]);

  return [ref, elementSpace] as const;
}
