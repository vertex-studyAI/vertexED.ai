import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import AccessibleModal from '@/components/AccessibleModal';
import { AI_CONSENT_EVENT, type ConsentRequest, setAiConsent } from '@/lib/aiConsent';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { useAuth } from '@/contexts/AuthContext';

export default function AiConsentDialog() {
  const { user } = useAuth();
  const [request,setRequest]=useState<ConsentRequest|null>(null);
  const active=useRef<ConsentRequest|null>(null);
  useEffect(()=>{
    const handle=(event:Event)=>{const next=(event as CustomEvent<ConsentRequest>).detail;active.current?.resolve(false);active.current=next;setRequest(next);};
    window.addEventListener(AI_CONSENT_EVENT,handle);
    return ()=>{window.removeEventListener(AI_CONSENT_EVENT,handle);active.current?.resolve(false);active.current=null;};
  },[]);
  useEffect(()=>{if(active.current&&active.current.scope!==getUserContentStorageScope()){active.current.resolve(false);active.current=null;setRequest(null);}},[user?.id]);
  const finish=(allowed:boolean)=>{const current=active.current;if(!current)return;if(current.scope===getUserContentStorageScope())setAiConsent(allowed);current.resolve(allowed);active.current=null;setRequest(null);};
  if(!request)return null;
  return <AccessibleModal titleId="ai-consent-title" descriptionId="ai-consent-description" onClose={()=>finish(false)} className="max-w-lg rounded-xl bg-card border border-border p-6 md:p-8 text-foreground"><h2 id="ai-consent-title" className="text-2xl font-semibold">Before you use AI</h2><p id="ai-consent-description" className="mt-4 text-base leading-relaxed">To answer this request, VertexED sends your prompt and the material you choose to include to its AI provider, OpenAI, Google or NVIDIA, depending on the configured feature. This can include text, images or audio. Avoid sharing sensitive personal information.</p><p className="mt-4 text-base leading-relaxed">AI can make mistakes. Check suggestions against your course materials. You can turn this permission off in Account Settings. Working Trace and manual study tools work without it.</p><Link to="/privacy" target="_blank" className="inline-block mt-4 text-primary underline">Read the privacy policy</Link><div className="flex flex-wrap gap-3 mt-6"><button type="button" className="min-h-11 rounded-lg bg-primary text-primary-foreground px-4" onClick={()=>finish(true)}>Allow AI for my requests</button><button type="button" className="min-h-11 rounded-lg border border-border px-4" onClick={()=>finish(false)}>Continue without AI</button></div></AccessibleModal>;
}
