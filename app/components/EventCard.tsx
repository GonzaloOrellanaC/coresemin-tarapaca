import React from 'react';
import { Icons } from './Icons';
import { EventItem } from '../types';

interface Props {
  event: EventItem;
  className?: string;
}

const EventCard: React.FC<Props> = ({ event, className = '' }) => {
    const apiBase = import.meta.env.VITE_FRONTEND_URL;
  const base = apiBase.replace(/\/(?:api\/?)?$/i, '') || window.location.origin.replace(/\/$/, '');

  return (
    <div className={`group bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-colors shadow-sm overflow-hidden flex flex-col h-full ${className}`}>
      <div className="h-48 relative overflow-hidden">
        <img
          src={`${base}/${event.coverImage}`}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-white/95 backdrop-blur-sm ${event.type === 'Capacitación' ? 'text-blue-700' : 'text-green-700'}`}>
            {event.type}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 min-w-[50px] border border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(event.dateEvent).toLocaleString('es-CL', { month: 'short' })}</span>
            <span className="text-xl font-bold text-gray-900 leading-none">{new Date(event.dateEvent).getDate()}</span>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Icons.MapPin className="w-3 h-3" /> <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">{event.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-auto">{event.description}</p>
      </div>
    </div>
  );
};

export default EventCard;
