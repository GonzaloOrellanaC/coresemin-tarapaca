import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import EventCard from '../components/EventCard';
import { getArticles, getEvents, getMiningActivities } from '../services/dataService';
import { Article, EventItem, MiningActivityItem } from '../types';
import { CORE_COLOR } from '../constants';

const Home: React.FC = () => {
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [miningActivities, setMiningActivities] = useState<MiningActivityItem[]>([]);
  
  // States for banner swipers
  const [chartIndex, setChartIndex] = useState(0);
  const [safetyIndex, setSafetyIndex] = useState(0);

  // Mock Data for Charts (Left Side)
    // Regional report data (replaces previous mock charts)
    const regionalReport = {
        informe: {
            titulo: 'Índice de Producción Minera Región de Tarapacá',
            fecha_emision: '2 de diciembre de 2025',
            periodo: { mes: 'Octubre', ano: 2025 },
            base: 'Promedio año 2014=100',
            datos: {
                indice_general_ipmin: {
                    indice: 105.29,
                    variacion_interanual_pct: -20.6,
                    variacion_acumulada_pct: -23.6,
                    variacion_mensual_pct: 17.7
                },
                divisiones: [
                    {
                        nombre: 'Minería del cobre',
                        codigo_division: '04',
                        indice: 102.09,
                        variacion_interanual_pct: -21.8,
                        variacion_acumulada_pct: -24.9,
                        variacion_mensual_pct: 18.6,
                        incidencia_indice_general_pp: -20.959
                    },
                    {
                        nombre: 'Otras minas y canteras',
                        codigo_division: '08',
                        indice: 224.08,
                        variacion_interanual_pct: 10.1,
                        variacion_acumulada_pct: 7.8,
                        variacion_mensual_pct: 5.5,
                        incidencia_indice_general_pp: 0.407
                    }
                ]
            }
        }
    }

    // Build slides array for the regional report so the left banner shows
    // smaller, focused chunks instead of cramming everything into one view.
    const reportSlides: React.ReactNode[] = [];

    // (Removed dedicated title slide) The title will be shown above every slide.

    // Slide: Índice general y variaciones
    reportSlides.push(
        <div className="mt-1 text-white">
            <div className="text-lg md:text-2xl font-extrabold">Índice general: {regionalReport.informe.datos.indice_general_ipmin.indice}</div>
            <div className="text-sm text-gray-300 mt-1">Variación interanual: {regionalReport.informe.datos.indice_general_ipmin.variacion_interanual_pct}%</div>
            <div className="text-sm text-gray-300">Variación acumulada: {regionalReport.informe.datos.indice_general_ipmin.variacion_acumulada_pct}%</div>
            <div className="text-sm text-gray-300">Variación mensual: {regionalReport.informe.datos.indice_general_ipmin.variacion_mensual_pct}%</div>
        </div>
    );

    // Slides: una por cada división para no amontonar datos
    regionalReport.informe.datos.divisiones.forEach((d: any, i: number) => {
        reportSlides.push(
            <div key={i} className="bg-white/5 p-3 rounded-md border border-gray-700 w-full">
                <div className="flex items-center justify-between">
                    <strong className="text-white">{d.nombre}</strong>
                    <span className="text-gray-300 text-sm">Índice: {d.indice}</span>
                </div>
                <div className="text-sm text-gray-300 mt-2">
                    <div>Var. interanual: {d.variacion_interanual_pct}%</div>
                    <div>Var. acumulada: {d.variacion_acumulada_pct}%</div>
                    <div>Var. mensual: {d.variacion_mensual_pct}%</div>
                    <div>Incidencia (pp): {d.incidencia_indice_general_pp}</div>
                </div>
            </div>
        );
    });

  // Mock Data for Safety Stats (Right Side)
  const safetyStats = [
    { mine: "Cía. Minera Doña Inés de Collahuasi", days: 450, location: "Pica, Tarapacá" },
    { mine: "Teck Quebrada Blanca Fase 2", days: 120, location: "Pozo Almonte, Tarapacá" },
    { mine: "BHP Cerro Colorado", days: 890, location: "Pozo Almonte, Tarapacá" },
    { mine: "Minera Cordillera", days: 365, location: "Iquique, Tarapacá" },
  ];

    const [blogPosts, setBlogPosts] = useState<Article[]>([]);

    useEffect(() => {
        // Load initial data
        (async () => {
                const news = await getArticles();
                setLatestNews(news.slice(0, 3));
                const ev = await getEvents();
                // Mostrar sólo eventos cuya fecha (dateEvent) sea hoy o en el futuro
                const todayStart = new Date();
                todayStart.setHours(0,0,0,0);
                const upcoming = ev.filter((e: EventItem) => {
                    const d = new Date(e.dateEvent);
                    return d >= todayStart;
                }).sort((a: EventItem, b: EventItem) => new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime());
                setEvents(upcoming.slice(0, 3));
                const blogs = news.filter(a => a.category === 'Blog');
                setBlogPosts(blogs.slice(0, 3));
                try {
                    const activities = await getMiningActivities(3);
                    setMiningActivities(activities);
                } catch (err) {
                    console.error('Error fetching mining activities:', err);
                }
            })();

        // set page meta
        document.title = 'Coresemin Tarapacá – Consejo Regional de Seguridad Minera';
        let md = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (!md) { md = document.createElement('meta'); md.name = 'description'; document.head.appendChild(md); }
        md.content = 'Consejo Regional de Seguridad Minera Tarapacá — noticias, eventos y capacitación para promover la seguridad en la industria.';

    // Timers for swipers (chart slides count is dynamic now)
        const slidesCount = reportSlides.length || 1;
        const chartTimer = setInterval(() => {
            setChartIndex((prev) => (prev + 1) % slidesCount);
        }, 4000);

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
                    src="/collahuasi-1.jpg" 
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
                </div>
            </div>
        </section>

        {/* 
            2. BANNER SECTION (Fixed Height)
            Height set to h-56 (14rem) to accommodate content + padding
        */}
        <div className="h-[calc(14rem*1.69)] lg:h-56 w-full bg-gray-800 border-t border-gray-700 shrink-0 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-700">
                
                {/* Left Swiper: Mining Charts */}
                <div className="p-4 md:p-6 relative overflow-hidden flex items-center group h-full">
                                            {reportSlides.map((slide, idx) => (
                                                <div key={idx} className={`absolute inset-0 p-4 md:p-6 transition-all duration-700 ease-in-out ${chartIndex === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                                                    <div>
                                                        <h3 className="text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Icons.BarChart className="w-3 h-3 md:w-4 md:h-4" /> {regionalReport.informe.titulo}
                                                            <span className="ml-2 text-green-200 font-extrabold text-xs md:text-sm">{regionalReport.informe.periodo.ano}</span>
                                                        </h3>
                                                    </div>
                                                    {slide}
                                                </div>
                                            ))}
                                            {/* Indicators (dynamic) */}
                                            <div className="absolute bottom-4 right-6 flex gap-1.5">
                                                {reportSlides.map((_, idx) => (
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
                                {/* Mostrar texto en lugar de número cuando no hay datos */}
                                <span className="block text-2xl md:text-5xl font-extrabold text-white leading-none tracking-tight">Sin Datos</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-green-400 uppercase tracking-wider block mt-1">Pronto más información</span>
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
          - Only shown if there is at least 1 blog post
          - Hidden on Mobile (block md:hidden for button only)
          - Visible on Desktop (hidden md:block for grid)
      */}
      {blogPosts.length > 0 && (
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
                                  <img src={post.image || (typeof post.coverImage === 'string' ? post.coverImage : '')} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors line-clamp-2">{post.title}</h4>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.subtitle}</p>
                                  <span className="text-[10px] text-gray-400 mt-2 block font-medium uppercase">{new Date(post.publishDate).toLocaleDateString('es-CL')}</span>
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
      )}

      {/* Stats / Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: Icons.Users, title: "Comunidad Activa", text: "Red de expertos y empresas colaborando." },
                { icon: Icons.BookOpen, title: "Capacitación", text: "Programas continuos de formación técnica." },
                { icon: Icons.MapPin, title: "Presencia Regional", text: "Impactando en faenas de todo Tarapacá." }
            ].map((item, idx) => {
                const card = (
                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 hover:shadow-2xl transition-all" style={{ borderColor: CORE_COLOR }}>
                        <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 text-green-700">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.text}</p>
                    </div>
                )

                if (item.title === 'Presencia Regional') {
                    return (
                        <Link key={idx} to="/presencia-regional" className="block">
                            {card}
                        </Link>
                    )
                }

                return <div key={idx}>{card}</div>
            })}
        </div>
      </section>

      {/* Upcoming Events: Oculto hasta que aparezca al menos un evento vigente */}
      {events.length > 0 && (
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
              {events.map((event) => (
                  <div key={event.id}>
                      <EventCard event={event} />
                  </div>
              ))}
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 1. SECCIÓN ACTIVIDADES                     */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Encabezado de la Sección */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-gray-200/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
              Somos Coresemin Tarapacá
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Actividades
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1.5">
              Noticias, hitos y actividades destacadas
            </p>
          </div>

          <Link to="/noticias" data-discover="true" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-700 group transition-all shrink-0">
            <span>Ver todas las noticias</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform transition-transform group-hover:translate-x-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </Link>
        </div>

        {/* Grid de Noticias (7 columnas principal / 5 columnas secundarias) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Noticia 1 (Principal Destacada) */}
          <article className="lg:col-span-7 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/70 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              {/* Contenedor de Imagen con Overlay y Badge */}
              <div className="relative overflow-hidden aspect-[16/10] w-full bg-gray-100">
                <img 
                  alt="CORESEMIN Tarapacá dio inicio al Mes de la Minería 2026 con jornada sobre seguridad y recursos hídricos" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  src="https://omcloudstorage.omtecnologia.cl/api/v1/public/files/local_1786648797532_d2y13m"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/800x500/111827/ffffff?text=CORESEMIN+Tarapacá';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 text-xs font-extrabold text-white uppercase rounded-full tracking-wider shadow-md bg-[#028938]">
                    Destacado
                  </span>
                </div>
              </div>

              {/* Contenido Noticia Principal */}
              <div className="p-6 md:p-8">
                <div className="flex items-center text-xs font-semibold text-gray-400 mb-3 space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                  <span>12 de agosto de 2026</span>
                  <span>•</span>
                  <span className="text-brand">Seguridad y Recursos Hídricos</span>
                </div>

                <Link to="/noticia/coresemin-tarapaca-dio-inicio-al-mes-de-la-mineria-2026-con-jornada-sobre-seguridad-y-recursos-hidricos" data-discover="true" className="block">
                  <h3 className="font-extrabold text-gray-900 group-hover:text-brand transition-colors text-xl sm:text-2xl lg:text-[26px] leading-tight tracking-tight">
                    CORESEMIN Tarapacá dio inicio al Mes de la Minería 2026 con jornada sobre seguridad y recursos hídricos
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm sm:text-base mt-3.5 line-clamp-3 leading-relaxed">
                  El Consejo Regional de Seguridad Minera de Tarapacá (CORESEMIN) dio inicio a las actividades del Mes de la Minería 2026 con un desayuno que reunió a autoridades, representantes de empresas, instituciones públicas y privadas y colaboradores vinculados a la seguridad minera.
                </p>
              </div>
            </div>

            {/* Footer Card Noticia Principal */}
            <div className="px-6 md:px-8 pb-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link className="text-sm font-bold text-brand hover:text-brand-700 flex items-center gap-2 group-hover:gap-3 transition-all" to="/noticia/coresemin-tarapaca-dio-inicio-al-mes-de-la-mineria-2026-con-jornada-sobre-seguridad-y-recursos-hidricos" data-discover="true">
                <span>Leer artículo completo</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
              <span className="text-xs text-gray-400 font-medium">Lectura: 3 min</span>
            </div>
          </article>

          {/* Columna Noticias Secundarias (5 columnas) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Noticia 2: Concurso de Pintura */}
            <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200/70 flex flex-col sm:flex-row h-full group hover:-translate-y-0.5">
              <div className="relative overflow-hidden sm:w-2/5 aspect-[16/10] sm:aspect-auto shrink-0 bg-gray-100">
                <img 
                  alt="Concurso de Pintura CORESEMIN 2026" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  src="https://omcloudstorage.omtecnologia.cl/api/v1/public/files/local_1786641718426_g4ylh"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x300/111827/ffffff?text=Concurso+Pintura';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase rounded-full shadow-sm bg-[#028938]">
                    Comunidad
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 sm:w-3/5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center text-xs font-semibold text-gray-400 mb-2 space-x-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                    <span>2 de julio de 2026</span>
                  </div>

                  <Link to="/noticia/ya-tenemos-a-los-premiados-del-concurso-de-pintura-coresemin-2026" data-discover="true">
                    <h4 className="font-bold text-gray-900 group-hover:text-brand transition-colors text-base sm:text-lg line-clamp-2 leading-snug">
                      ¡Ya tenemos a los premiados del Concurso de Pintura CORESEMIN 2026!
                    </h4>
                  </Link>

                  <p className="text-gray-500 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
                    Con mucha alegría damos a conocer el listado oficial de premiados del certamen “Innovación y Tecnología así imagino la minería del mañana”.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link className="text-xs sm:text-sm font-bold text-brand hover:text-brand-700 flex items-center gap-1.5 group-hover:gap-2 transition-all" to="/noticia/ya-tenemos-a-los-premiados-del-concurso-de-pintura-coresemin-2026" data-discover="true">
                    <span>Leer noticia</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </Link>
                </div>
              </div>
            </article>

            {/* Noticia 3: Cursos Monitores */}
            <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200/70 flex flex-col sm:flex-row h-full group hover:-translate-y-0.5">
              <div className="relative overflow-hidden sm:w-2/5 aspect-[16/10] sm:aspect-auto shrink-0 bg-gray-100">
                <img 
                  alt="Cursos Monitores en Seguridad Minera 2026" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  src="https://omcloudstorage.omtecnologia.cl/api/v1/public/files/local_1786641707870_s4qjr7"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x300/111827/ffffff?text=Cursos+Monitores';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase rounded-full shadow-sm bg-[#028938]">
                    Capacitación
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 sm:w-3/5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center text-xs font-semibold text-gray-400 mb-2 space-x-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                    <span>10 de junio de 2026</span>
                  </div>

                  <Link to="/noticia/tarapaca-da-inicio-a-la-8-version-de-los-cursos-monitores-en-seguridad-minera-2026" data-discover="true">
                    <h4 className="font-bold text-gray-900 group-hover:text-brand transition-colors text-base sm:text-lg line-clamp-2 leading-snug">
                      Tarapacá da inicio a la 8ª versión de los Cursos Monitores 2026
                    </h4>
                  </Link>

                  <p className="text-gray-500 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
                    Iniciativa formativa impulsada junto a Sernageomin, Seremi de Minería y Seremi de Educación para trabajadores del sector.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link className="text-xs sm:text-sm font-bold text-brand hover:text-brand-700 flex items-center gap-1.5 group-hover:gap-2 transition-all" to="/noticia/tarapaca-da-inicio-a-la-8-version-de-los-cursos-monitores-en-seguridad-minera-2026" data-discover="true">
                    <span>Leer noticia</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </Link>
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECCIÓN ACTIVIDAD MINERA (Nueva Colección) */}
      {/* ========================================== */}
      {miningActivities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-200/80 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Actualidad Externa
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                Actividad Minera
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Últimas publicaciones y novedades del ecosistema minero regional
              </p>
            </div>

            <Link 
              to="/actividad-minera" 
              className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-700 group transition-all shrink-0"
            >
              <span>Ver todas las actividades</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform transition-transform group-hover:translate-x-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {miningActivities.slice(0, 3).map((item) => (
              <a 
                key={item.id || item._id} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/80 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Imagen de la Tarjeta con Badge de Plataforma */}
                  <div className="relative overflow-hidden aspect-[16/10] w-full bg-gray-100">
                    <img 
                      src={item.imageUrl || '/CORESEMIN-LOGO.png'} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/CORESEMIN-LOGO.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    
                    {item.sourcePlatform && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-bold text-white uppercase rounded-full shadow-md bg-[#028938]/90 backdrop-blur-sm">
                          {item.sourcePlatform}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center text-xs font-semibold text-gray-400 mb-2.5 gap-2">
                      <Icons.Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{new Date(item.publishDate).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {item.authorName && (
                        <>
                          <span>•</span>
                          <span className="text-gray-600 line-clamp-1">{item.authorName}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors text-lg line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-gray-600 text-sm mt-2.5 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer de la Tarjeta */}
                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Ver publicación original
                    <Icons.ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 2. BANNER INSTITUCIONAL Y CONVOCATORIA     */}
      {/* ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 border border-gray-800 shadow-2xl p-8 sm:p-10 lg:p-12">
          
          {/* Efecto de luz ambiental decorativo */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Bloque de Texto e Identidad */}
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/60 border border-brand-500/30 text-green-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Comité Regional de Seguridad Minera
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Participa en nuestras mesas de trabajo y actividades
              </h3>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Revisa el calendario oficial de eventos regionales, jornadas de seguridad y accede a los artículos técnicos publicados por nuestros comités de especialistas.
              </p>
            </div>

            {/* Botones de Acción (CTAs) */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto shrink-0 justify-center">
              <Link 
                to="/eventos" 
                data-discover="true"
                className="px-6 py-3.5 rounded-xl text-sm font-bold text-center text-white bg-[#028938] hover:bg-brand-600 active:scale-95 shadow-lg shadow-brand-950/40 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                <span>Ver Próximos Eventos</span>
              </Link>

              <Link 
                to="/blogs" 
                data-discover="true"
                className="px-6 py-3.5 rounded-xl text-sm font-bold text-center text-white bg-white/10 hover:bg-white/15 active:scale-95 border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path></svg>
                <span>Biblioteca Técnica & Blog</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;