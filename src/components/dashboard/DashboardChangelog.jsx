
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GitCommit } from 'lucide-react';

const actionColors = {
  created: 'emerald',
  updated: 'yellow',
  deleted: 'red',
  generated: 'cyan'
};

const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function DashboardChangelog({ entries }) {
  return (
    <Card className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
        <CardTitle className="text-white dark:text-white light:text-slate-900 text-xl font-semibold tracking-tight flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-orange-400" />
          Recent Activity
        </CardTitle>
        <Link to={createPageUrl("BugCatcher")} className="text-sm text-cyan-400 hover:text-cyan-300">View All</Link>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-4">
          {entries && entries.length > 0 ? entries.map(entry => {
            const actionColor = actionColors[entry.action] || 'slate';
            return (
              <div key={entry.id} className="flex items-start gap-4">
                <div className={`mt-1.5 w-2 h-2 rounded-full bg-${actionColor}-400`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                    <span className={`font-semibold text-${actionColor}-400`}>{entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}</span>: <span className="font-semibold text-white dark:text-white light:text-slate-900">{entry.item_name}</span> in {entry.module}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-500">{formatTimeAgo(entry.created_date)}</p>
                </div>
              </div>
            )
          }) : (
            <p className="text-center text-slate-500 dark:text-slate-500 light:text-slate-500 py-4">No recent activity logged.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
