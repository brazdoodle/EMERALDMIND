import React from 'react';

export default function RawOutputModal({ open, onClose, title = 'Raw Model Output', output, onRetry }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-lg p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {onRetry && (
              <button onClick={onRetry} className="text-sm text-blue-600 hover:underline">Retry (strict)</button>
            )}
            <button onClick={onClose} className="text-sm text-slate-600">Close</button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs max-h-[60vh] overflow-auto bg-slate-100 dark:bg-slate-800 p-3 rounded">{output}</pre>
      </div>
    </div>
  );
}
