import React from 'react';
import { History, UserPlus, UserMinus, Zap, HeartHandshake, Eye } from 'lucide-react';
import { VisionEvent } from '../types/events';

interface EventLogProps {
  logs: VisionEvent[];
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PERSON_ENTERED':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'PERSON_LEFT':
      case 'ALL_PEOPLE_LEFT':
        return <UserMinus className="w-4 h-4 text-rose-400" />;
      case 'SUDDEN_EXPRESSION_CHANGE':
      case 'EXPRESSION_CHANGED':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'MUTUAL_INTERACTION':
        return <HeartHandshake className="w-4 h-4 text-blue-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col space-y-4 max-h-[380px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <History className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            EVENT LOG
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {logs.length} Event{logs.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No events recorded yet. Start the camera and perform facial expressions to trigger dramatic events.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3 hover:border-slate-700 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 mt-0.5 shrink-0">
                {getEventIcon(log.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-mono text-amber-500 font-semibold">
                    {log.timeFormatted}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {log.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug font-sans">
                  {log.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

