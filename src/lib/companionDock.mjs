/** Watch the real footer, including changes caused by asynchronous page content. */
export function observeFooterVisibility(footer, onChange, view = window) {
  let active = true;
  let previous;
  const publish = visible => {
    if (!active || visible === previous) return;
    previous = visible;
    onChange(visible);
  };
  const measure = () => {
    const rect = footer.getBoundingClientRect();
    publish(rect.height > 0 && rect.bottom > 0 && rect.top < view.innerHeight);
  };
  measure();
  if (typeof view.IntersectionObserver === 'function') {
    const observer = new view.IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === footer);
      // Dock at the boundary too: a threshold-zero observer may not emit again
      // between edge contact and the first visible pixel.
      if (entry) publish(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(footer);
    return () => { active = false; observer.disconnect(); };
  }
  view.addEventListener('scroll', measure, { passive: true });
  view.addEventListener('resize', measure);
  return () => {
    active = false;
    view.removeEventListener('scroll', measure);
    view.removeEventListener('resize', measure);
  };
}

/** Keep the same launcher node and keyboard focus when changing its container. */
export function moveCompanionHost(host, destination) {
  if (!host || !destination || host.parentNode === destination) return;
  const focused = host.ownerDocument.activeElement;
  const restore = focused && host.contains(focused);
  destination.appendChild(host);
  if (restore && focused.isConnected) focused.focus({ preventScroll: true });
}
