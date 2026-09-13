import { useEffect, useState } from 'react';

export default function EncryptedText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval>;
    const finish = () => { clearInterval(timer); setDisplay(text); };
    if (!preference.matches) {
      let step = 0;
      timer = setInterval(() => {
        step += 1;
        setDisplay([...text].map((letter, index) => index < step * 2 || letter === ' ' ? letter : '01/+'[(index + step) % 4]).join(''));
        if (step * 2 >= text.length) finish();
      }, 35);
    }
    preference.addEventListener('change', finish);
    return () => { clearInterval(timer); preference.removeEventListener('change', finish); };
  }, [text]);
  return <><span className="sr-only">{text}</span><span aria-hidden="true">{display}</span></>;
}
