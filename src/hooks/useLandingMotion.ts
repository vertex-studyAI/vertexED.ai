import { useEffect, type RefObject } from 'react';

/** Passive observation drives visual depth, never the document's scroll position. */
export function useLandingMotion(rootRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px)');
    const transparency = matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)');
    let frame = 0;
    let pointerFrame = 0;
    let surface: HTMLElement | null = null;
    let position = { x: .5, y: .5 };
    const resetSurface = () => {
      cancelAnimationFrame(pointerFrame); pointerFrame = 0;
      if (surface) {
        ['--surface-x', '--surface-y', '--tilt-x', '--tilt-y'].forEach(key => surface?.style.removeProperty(key));
        surface.removeAttribute('data-lit');
      }
      surface = null;
    };
    const move = (event: PointerEvent) => {
      if (!enabled || reduced.matches || !pointer.matches || transparency.matches || document.hidden || event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-float]') : null;
      if (target !== surface) { resetSurface(); surface = target; }
      if (!surface || surface.matches(':focus-within')) return;
      const bounds = surface.getBoundingClientRect();
      position = {
        x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / Math.max(1, bounds.width))),
        y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / Math.max(1, bounds.height))),
      };
      if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!surface) return;
        surface.style.setProperty('--surface-x', `${position.x * 100}%`);
        surface.style.setProperty('--surface-y', `${position.y * 100}%`);
        surface.style.setProperty('--tilt-x', `${(position.y - .5) * -4}deg`);
        surface.style.setProperty('--tilt-y', `${(position.x - .5) * 4}deg`);
        surface.setAttribute('data-lit', 'true');
      });
    };
    const render = () => {
      frame = 0;
      const hero = root.querySelector<HTMLElement>('.landing-hero');
      const progress = hero ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight)) : 0;
      root.style.setProperty('--scroll-depth', String(enabled && !reduced.matches ? progress : 0));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(render); };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('has-entered'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    root.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    window.addEventListener('scroll', scroll, { passive: true });
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', resetSurface);
    root.addEventListener('focusin', resetSurface);
    window.addEventListener('blur', resetSurface);
    window.addEventListener('resize', resetSurface);
    document.addEventListener('visibilitychange', resetSurface);
    [reduced, pointer, transparency].forEach(query => query.addEventListener('change', resetSurface));
    reduced.addEventListener('change', render); render();
    return () => {
      resetSurface(); cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', scroll); reduced.removeEventListener('change', render);
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', resetSurface);
      root.removeEventListener('focusin', resetSurface); window.removeEventListener('blur', resetSurface);
      window.removeEventListener('resize', resetSurface); document.removeEventListener('visibilitychange', resetSurface);
      [reduced, pointer, transparency].forEach(query => query.removeEventListener('change', resetSurface));
      root.style.removeProperty('--scroll-depth');
    };
  }, [rootRef, enabled]);
}
