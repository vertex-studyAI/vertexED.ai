import { useEffect, useState } from 'react';
import { Clock3, Layers, ScanLine } from 'lucide-react';

const sections = [
  { id: 'revision-example', label: 'The revision loop', Icon: ScanLine },
  { id: 'study-tools', label: 'The tools', Icon: Layers },
  { id: 'exam-session', label: 'Exam prep', Icon: Clock3 },
];

/** Native anchors with reading-position feedback, never scroll interception. */
export default function LandingDock() {
  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= Math.max(200, innerHeight * .35)) current = section.id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    const landing = document.querySelector('.landing-v3');
    if (landing) observer.observe(landing);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
    };
  }, []);
  return <nav className="landing-dock" aria-label="Explore this page">
    {sections.map(({ id, label, Icon }, index) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
      <span className="dock-number" aria-hidden>0{index + 1}</span><Icon size={17} aria-hidden/><span>{label}</span>
    </a>)}
  </nav>;
}
