import { useState } from 'react';
import { aiConsentEnabled, setAiConsent } from '@/lib/aiConsent';
import { Link } from 'react-router';
export default function AiPrivacySettings() {
  const [allowed,setAllowed]=useState(aiConsentEnabled);
  return <section className="rounded-xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">AI processing</h2><p className="text-base leading-relaxed text-muted-foreground mt-3">Permission is {allowed?'enabled':'off'} on this device for this account. When off, you will be asked before a new AI request sends material to a provider.</p><button type="button" className="mt-4 min-h-11 rounded-lg border border-border px-4" onClick={()=>{setAiConsent(false);setAllowed(false);}}>Turn off AI permission</button><Link to="/learning-evidence" className="block mt-5 text-primary underline">View or clear Working Trace evidence</Link></section>;
}
