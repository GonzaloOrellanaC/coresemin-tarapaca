import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import NewsCard from '../components/NewsCard';
import { getArticles, getEvents } from '../services/dataService';
import { Article, EventItem } from '../types';
import { CORE_COLOR } from '../constants';

const Home: React.FC = () => {
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  
  // States for banner swipers
  const [chartIndex, setChartIndex] = useState(0);
  const [safetyIndex, setSafetyIndex] = useState(0);

  // Mock Data for Charts (Left Side)
  const miningCharts = [
    {
      title: "Exportación de Cobre 2024",
      subtitle: "Aumento sostenido del 12% trimestral",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      icon: Icons.TrendingUp
    },
    {
      title: "Producción Regional",
      subtitle: "4.5 Millones de toneladas métricas",
      image: "https://images.unsplash.com/photo-1543286386-713df548e9cc?q=80&w=800&auto=format&fit=crop",
      icon: Icons.BarChart
    },
    {
      title: "Inversión en Tecnología",
      subtitle: "Automatización de flotas en un 85%",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=800&auto=format&fit=crop",
      icon: Icons.Activity
    }
  ];

  // Mock Data for Safety Stats (Right Side)
  const safetyStats = [
    { mine: "Cía. Minera Doña Inés de Collahuasi", days: 450, location: "Pica, Tarapacá" },
    { mine: "Teck Quebrada Blanca Fase 2", days: 120, location: "Pozo Almonte, Tarapacá" },
    { mine: "BHP Cerro Colorado", days: 890, location: "Pozo Almonte, Tarapacá" },
    { mine: "Minera Cordillera", days: 365, location: "Iquique, Tarapacá" },
  ];

  // Mock Data for Blog Summary
  const blogPosts = [
    {
        id: 1,
        title: "Automatización en Flotación",
        excerpt: "Nuevas tecnologías de celdas neumáticas reducen el consumo energético en un 15%.",
        image: "https://images.unsplash.com/photo-1626084772352-7df7831d10e5?q=80&w=800&auto=format&fit=crop",
        date: "12 Oct"
    },
    {
        id: 2,
        title: "Hidrógeno Verde en Minería",
        excerpt: "Pilotos en Tarapacá demuestran viabilidad para camiones CAEX.",
        image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=800&auto=format&fit=crop",
        date: "05 Oct"
    },
    {
        id: 3,
        title: "Seguridad 4.0 con IA",
        excerpt: "Sistemas de visión computarizada previenen fatiga en operadores.",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
        date: "28 Sep"
    }
  ];

  useEffect(() => {
    // Load initial data
    setLatestNews(getArticles().slice(0, 3));
    setEvents(getEvents().slice(0, 3));

    // Timers for swipers
    const chartTimer = setInterval(() => {
      setChartIndex((prev) => (prev + 1) % miningCharts.length);
    }, 5000);

    const safetyTimer = setInterval(() => {
      setSafetyIndex((prev) => (prev + 1) % safetyStats.length);
    }, 4000);

    return () => {
      clearInterval(chartTimer);
      clearInterval(safetyTimer);
    };
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 
          LANDING CONTAINER 
          Height Calculation: 100vh (Screen) - 5rem (Navbar Height) 
          Structure: Flex Column
      */}
      <div className="flex flex-col h-[calc(100vh-5rem)] bg-gray-900">

        {/* 
            1. HERO SECTION (Flexible Height)
            Occupies all remaining space (flex-1)
        */}
        <section className="relative flex-1 flex items-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://coresemintarapaca.cl/wp-content/uploads/2020/06/collahuasi-1.jpg" 
                    alt="Minería Tarapacá" 
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-gray-900/60"></div>
            </div>

            {/* Content Centered in the Hero Space */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl space-y-6 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/50 border border-green-500/30 text-green-300 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Seguridad y Excelencia Minera
                    </div>
                    {/* UPDATED: Title Size reduced for Mobile (text-3xl sm:text-4xl) */}
                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
                        Comprometidos con la <span style={{ color: '#22c55e' }}>Seguridad</span>
                    </h1>
                    {/* UPDATED: Description Size reduced for Mobile (text-sm) */}
                    <p className="text-sm md:text-2xl text-gray-200 leading-relaxed max-w-xl drop-shadow-lg">
                        Impulsamos estándares de clase mundial y colaboración estratégica para proteger a nuestras personas en Tarapacá.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Link 
                            to="/noticias" 
                            className="px-8 py-3 rounded-lg font-bold text-white transition transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
                            style={{ backgroundColor: CORE_COLOR }}
                        >
                            Ver Noticias <Icons.ArrowRight className="w-5 h-5"/>
                        </Link>
                        <Link 
                            to="/nosotros" 
                            className="px-8 py-3 rounded-lg font-bold bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition flex items-center justify-center"
                        >
                            Conócenos
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        {/* 
            2. BANNER SECTION (Fixed Height)
            Height set to h-56 (14rem) to accommodate content + padding
        */}
        <div className="h-56 w-full bg-gray-800 border-t border-gray-700 shrink-0 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-700">
                
                {/* Left Swiper: Mining Charts */}
                <div className="p-4 md:p-6 relative overflow-hidden flex items-center group h-full">
                    {miningCharts.map((chart, idx) => (
                        <div 
                            key={idx}
                            className={`absolute inset-0 p-4 md:p-6 flex items-center gap-4 md:gap-6 transition-all duration-700 ease-in-out ${
                                idx === chartIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                            }`}
                        >
                            <div className="relative w-28 h-20 md:w-36 md:h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-lg border border-gray-600">
                                <img src={chart.image} alt="Chart" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <chart.icon className="w-6 h-6 md:w-10 md:h-10 text-white/90" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2">
                                    <Icons.BarChart className="w-3 h-3 md:w-4 md:h-4" /> Datos Regionales
                                </h3>
                                {/* Responsive Font Size: Small on Mobile, Large on Desktop */}
                                <p className="text-sm md:text-2xl font-bold text-white leading-tight mb-1">{chart.title}</p>
                                <p className="text-gray-400 text-[10px] md:text-sm">{chart.subtitle}</p>
                            </div>
                        </div>
                    ))}
                    {/* Indicators */}
                    <div className="absolute bottom-4 right-6 flex gap-1.5">
                        {miningCharts.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setChartIndex(idx)}
                                className={`h-1 md:h-1.5 rounded-full transition-all ${idx === chartIndex ? 'w-4 md:w-8 bg-green-500' : 'w-1.5 md:w-2 bg-gray-600'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Swiper: Safety Stats */}
                <div className="p-4 md:p-6 relative overflow-hidden flex items-center bg-gray-800/50 h-full">
                    {safetyStats.map((stat, idx) => (
                        <div 
                            key={idx}
                            className={`absolute inset-0 p-4 md:p-6 flex items-center justify-between transition-all duration-500 ease-in-out ${
                                idx === safetyIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                        >
                            <div className="pr-2 md:pr-4 flex-1">
                                <div className="flex items-center gap-2 mb-1 md:mb-3">
                                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-900/50 text-green-500">
                                        <Icons.ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                                    </span>
                                    <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Seguridad Operacional</span>
                                </div>
                                {/* Responsive Font Size: Small on Mobile, Large on Desktop */}
                                <h3 className="text-sm md:text-2xl font-bold text-white mb-1 leading-tight">{stat.mine}</h3>
                                <p className="text-gray-500 text-[10px] md:text-xs flex items-center gap-1 mt-1">
                                    <Icons.MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" /> {stat.location}
                                </p>
                            </div>
                            <div className="text-right bg-gradient-to-br from-green-900/40 to-green-800/20 px-3 py-2 md:px-5 md:py-3 rounded-xl border border-green-500/20 flex-shrink-0 ml-2">
                                {/* Responsive Font Size: Small on Mobile (2xl), Huge on Desktop (5xl) */}
                                <span className="block text-2xl md:text-5xl font-extrabold text-white leading-none tracking-tight">{stat.days}</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-green-400 uppercase tracking-wider block mt-1">Días sin Accidentes</span>
                            </div>
                        </div>
                    ))}
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-green-600 transition-all duration-300 ease-linear" style={{ width: `${((safetyIndex + 1) / safetyStats.length) * 100}%` }}></div>
                </div>

            </div>
        </div>

      </div>
      {/* End Landing Container */}

      {/* NEW: Blog Summary Section */}
      {/* 
          Logic:
          - Hidden on Mobile (block md:hidden for button only)
          - Visible on Desktop (hidden md:block for grid)
      */}
      <section className="bg-gray-50 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Desktop View: Cards */}
            <div className="hidden md:block">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Icons.BookOpen className="w-6 h-6 text-green-600"/> Blogs Técnicos de Minería
                    </h3>
                    <Link to="/blogs" className="text-sm text-green-700 font-semibold hover:underline">Ver todos los blogs</Link>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <Link key={post.id} to="/blogs" className="group bg-white rounded-lg p-4 shadow-sm hover:shadow-md border border-gray-200 transition-all flex gap-4 items-center">
                            <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors line-clamp-2">{post.title}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block font-medium uppercase">{post.date}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile View: High Contrast Button */}
            <div className="md:hidden">
                <Link 
                    to="/blogs" 
                    className="w-full py-4 rounded-xl flex items-center justify-between px-6 shadow-lg transform active:scale-95 transition-all"
                    style={{ backgroundColor: CORE_COLOR }}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg text-white">
                            <Icons.BookOpen className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <span className="block text-white font-bold text-lg leading-none">Blogs de Minería</span>
                            <span className="text-white/80 text-xs">Artículos técnicos y estudios</span>
                        </div>
                    </div>
                    <div className="bg-white text-green-700 rounded-full p-1">
                        <Icons.ChevronRight className="w-4 h-4" />
                    </div>
                </Link>
            </div>

        </div>
      </section>

      {/* Stats / Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: Icons.Users, title: "Comunidad Activa", text: "Red de expertos y empresas colaborando." },
                { icon: Icons.BookOpen, title: "Capacitación", text: "Programas continuos de formación técnica." },
                { icon: Icons.MapPin, title: "Presencia Regional", text: "Impactando en faenas de todo Tarapacá." }
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border-t-4 hover:shadow-2xl transition-all" style={{ borderColor: CORE_COLOR }}>
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 text-green-700">
                        <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.text}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Próximos Eventos</h2>
                <p className="text-gray-500 mt-1">Participa en nuestras actividades</p>
            </div>
            <Link to="/eventos" className="text-sm font-semibold text-green-700 hover:text-green-800 flex items-center gap-1">
                Ver calendario <Icons.ArrowRight className="w-4 h-4"/>
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.length > 0 ? events.map((event) => (
                <div key={event.id} className="group bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-colors shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="h-48 relative overflow-hidden">
                        <img 
                            src={event.image} 
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
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(event.date).toLocaleString('es-CL', { month: 'short' })}</span>
                                <span className="text-xl font-bold text-gray-900 leading-none">{new Date(event.date).getDate()}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Icons.MapPin className="w-3 h-3" /> <span className="line-clamp-1">{event.location}</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">{event.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-auto">{event.description}</p>
                    </div>
                </div>
            )) : (
                <p className="text-gray-500 col-span-3 text-center py-10">No hay eventos próximos programados.</p>
            )}
        </div>
      </section>

      {/* News Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-3xl font-bold text-gray-900">Actualidad</h2>
                <p className="text-gray-500 mt-1">Noticias destacadas del sector</p>
            </div>
            <Link to="/noticias" className="text-sm font-semibold text-green-700 hover:text-green-800 flex items-center gap-1">
                Ver todas <Icons.ArrowRight className="w-4 h-4"/>
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((article, index) => (
                <div key={article.id} className={index === 0 ? "md:col-span-2 h-full" : "h-full"}>
                    <NewsCard article={article} featured={index === 0} />
                </div>
            ))}
        </div>
      </section>

    </div>
  );
};

export default Home;