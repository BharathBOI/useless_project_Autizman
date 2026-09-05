import React from 'react';
import { SerialEvent } from '../types/events';
import { History, BellRing, UserCheck, UserMinus, Zap, Eye } from 'lucide-react';

interface EventLogProps {
  events: SerialEvent[];
  onClear: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ events, onClear }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PERSON_ENTERED':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'PERSON_LEFT':
      case 'ALL_PEOPLE_LEFT':
        return <UserMinus className="w-4 h-4 text-gray-400" />;
      case 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE':
        return <Zap className="w-4 h-4 text-amber-400 animate-bounce" />;
      case 'MUTUAL_INTERACTION':
        return <Eye className="w-4 h-4 text-purple-400" />;
      default:
        return <BellRing className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="glass-panel p-5 w-full flex flex-col h-72 border border-white/10">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 font-mono">
            DRAMATIC EVENT LOG
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-[10px] font-mono text-red-300">
            {events.length}
          </span>
        </div>
        {events.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear Log
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 italic text-center p-4">
            No dramatic events yet. Move in front of the camera, change expressions, or smile!
          </div>
        ) : (
          events.slice(0, 40).map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-3 hover:border-red-500/30 transition-all"
            >
              <div className="p-1 rounded bg-white/5 mt-0.5">{getEventIcon(ev.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-200">{ev.type}</span>
                  <span className="text-[10px] text-gray-500">{ev.formattedTime}</span>
                </div>
                <p className="text-gray-400 mt-0.5 text-[11px] leading-relaxed">
                  {ev.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
