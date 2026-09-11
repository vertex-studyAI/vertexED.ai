import { Link } from 'react-router';
import { Bot, ArrowRight } from 'lucide-react';
import ApexPromptChips from '@/components/chat/ApexPromptChips';
import { getStudyContext } from '@/lib/studyContext';
import { useAuth } from '@/contexts/AuthContext';
import { APEX_TAGLINE } from '@/content/apex';
import { storeApexPrefill } from '@/lib/apexPrefillStorage.mjs';
import { toast } from '@/hooks/use-toast';

export default function ApexQuickAsk() {
  const { user } = useAuth();
  const context = getStudyContext('/main', user);

  return (
    <section className="px-6 pb-6 fade-up">
      <div className="max-w-6xl mx-auto neu-card p-5 md:p-6 apex-quick-ask">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="apex-avatar">
              <Bot className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ask Apex</h2>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-xl">{APEX_TAGLINE}</p>
            </div>
          </div>
          <Link to="/chatbot" className="btn-glass text-sm inline-flex items-center gap-1.5 shrink-0">
            Open full chat
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ApexPromptChips
          context={context}
          onSelect={(text) => {
            if (!storeApexPrefill(window, user?.id ?? null, text)) {
              toast({
                title: 'Could not carry this prompt into Apex',
                description: 'Temporary browser storage is unavailable. Open the full chat and paste your question instead.',
                variant: 'destructive',
              });
              return;
            }
            window.location.assign('/chatbot');
          }}
        />
      </div>
    </section>
  );
}
