import { useCallback, useEffect, useState } from "react";

// Hook to reveal elements on scroll using Intersection Observer API
// when they enter the viewport it will set isVisible to true
// and can be used to trigger CSS animations or other effects

export function useRevealOnScroll<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null); // Ref to the observed element, null at start
  const [isVisible, setIsVisible] = useState(false); // Visibility state, false at start

  // catch the dom
  //callback to avoid ref change on each render
  // [] means the callback is stable and never changes
  const ref = useCallback((node: T | null) => {
    // we store the node in state
    setElement(node);
  }, []);

  useEffect(() => {
    // if no element to observe, do nothing
    if (!element) return;

    // accessibility: if user prefers reduced motion, reveal immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    // intersection observer setup is a native browser API
    // better than manual scroll event listeners
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          //element is visible in viewport
          if (entry.isIntersecting) {
            // element is visible
            setIsVisible(true);
            // once visible, we can stop observing
            // because we only need to reveal once
            observer.disconnect();
          }
        });
      },
      {
        // 20% of the element must be visible to trigger
        threshold: 0.2,
      },
    );

    // start observing the element
    observer.observe(element);

    // cleanup function to disconnect observer on unmount or element change
    // it helps prevent memory leaks
    return () => {
      observer.disconnect();
    };
  }, [element]); // re-run effect if element changes

  // return the ref callback and visibility state
  return { ref, isVisible };
}
