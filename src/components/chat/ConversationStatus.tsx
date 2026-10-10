import { useState } from 'react';
import { downloadConversations, type getConversationStore } from '@/lib/conversations';

type Props = {
  store: ReturnType<typeof getConversationStore>;
  persistence: ReturnType<ReturnType<typeof getConversationStore>['getSnapshot']>;
  recoveryText?: string;
};

export default function ConversationStatus({ store, persistence, recoveryText }: Props) {
  const [exportError, setExportError] = useState('');
  return <div className="my-3 space-y-2 text-sm">
    <p role="status">{persistence.status}</p>
    <div className="flex flex-wrap gap-2">
      {!persistence.readOnly && (persistence.dirty || !persistence.status.includes('saved to your account')) && <button type="button" className="btn-glass text-sm" onClick={() => void store.load()}>Retry account save</button>}
      <button type="button" className="btn-glass text-sm" onClick={() => {
        try { downloadConversations(store); setExportError(''); }
        catch { setExportError('Export could not start. Copy your visible conversation before leaving this page.'); }
      }}>Export conversations</button>
      {persistence.readOnly && <button type="button" className="btn-glass text-sm" onClick={() => void store.load(true)}>Reload account copy</button>}
    </div>
    {persistence.readOnly && <p>Reload keeps a device backup for account export. It replaces the conversation shown here.</p>}
    {exportError && <p role="alert">{exportError}</p>}
    {recoveryText && <div role="alert"><p>This reply was not saved. Copy it before leaving.</p><textarea aria-label="Unsaved tutor reply" readOnly value={recoveryText} className="w-full min-h-24 rounded border border-border bg-background p-2" /></div>}
  </div>;
}
