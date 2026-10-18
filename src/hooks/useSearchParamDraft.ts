import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/** Keep typing urgent while BrowserRouter commits URL changes in a transition. */
export function useSearchParamDraft(urlValue: string) {
  const { key } = useLocation();
  const navigationType = useNavigationType();
  const [draft, setDraft] = useState(urlValue);
  const pendingValue = useRef<string | null>(null);

  useEffect(() => {
    if (navigationType === 'POP' || pendingValue.current === null) {
      pendingValue.current = null;
      setDraft(urlValue);
    } else if (pendingValue.current === urlValue) {
      pendingValue.current = null;
    }
    // Ignore an intermediate URL echo while a newer keystroke is pending.
  }, [key, navigationType, urlValue]);

  function updateDraft(value: string) {
    pendingValue.current = value;
    setDraft(value);
  }

  return [draft, updateDraft] as const;
}
