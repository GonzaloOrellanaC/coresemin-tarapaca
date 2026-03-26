import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/dataService';
import { EventItem } from '../types';
import { Icons } from '../components/Icons';

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
        // getEvents is async; fetch and set results
        let mounted = true;
        (async () => {
            try {
                const res = await getEvents();
                if (mounted) setEvents(res);
            } catch (e) {
                if (mounted) setEvents([]);
            }
        })();
        return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Calendario de Eventos</h1>
            <p className="text-gray-500">Seminarios, reuniones y capacitaciones de Coresemin Tarapacá.</p>
        </div>

        <div className="space-y-6">
            {events.length === 0 ? (
                 <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">No hay eventos programados.</div>
            ) : (
                events.map((event) => {
                    const date = new Date(event.dateEvent);
                    const isPast = (date.toString() === 'Invalid Date' || date.getTime() < Date.now()) ? true : false;
                    return (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:flex-row group">
                            
                            {/* Image Section */}
                            <div className="md:w-64 lg:w-72 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                                <img 
                                    src={event.coverImage} 
                                    alt={event.title} 
                                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
                                <div className="absolute top-4 left-4 md:hidden">
                                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 shadow-sm ${event.type === 'Capacitación' ? 'text-blue-700' : 'text-green-700'}`}>
                                        {event.type}
                                    </span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-6 items-start">
                                
                                <div className="hidden md:flex flex-col items-center bg-green-50 text-green-700 rounded-xl p-3 min-w-[80px] border border-green-100 text-center">
                                    <span className="text-sm uppercase font-bold tracking-wider">{date.toLocaleString('es-CL', { month: 'short' })}</span>
                                    <span className="text-3xl font-bold leading-none my-1">{date.getDate()}</span>
                                    <span className="text-xs text-gray-500">{date.getFullYear()}</span>
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                     <div className="flex items-center gap-3 md:hidden mb-1">
                                         <span className="font-bold text-green-700 uppercase text-sm">{date.toLocaleDateString('es-CL', {day: 'numeric', month: 'long'})}</span>
                                     </div>
                                     <div className="hidden md:flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${event.type === 'Capacitación' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                                            {event.type}
                                        </span>
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{event.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm md:text-base">{event.description}</p>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-400 gap-3 sm:gap-6 pt-2">
                                        <span className="flex items-center gap-1.5"><Icons.MapPin className="w-4 h-4 text-gray-300" /> {event.location}</span>
                                        <span className="flex items-center gap-1.5"><Icons.Calendar className="w-4 h-4 text-gray-300" /> {date.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})} hrs</span>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto mt-2 md:mt-0 flex-shrink-0 self-center">
                                    <button
                                        disabled={isPast}
                                        className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm ${isPast ? 'bg-gray-100 border border-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                                    >
                                        {isPast ? 'Evento terminado' : 'Ver Detalles'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};

export default Events;