import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { CORE_COLOR, SOCIAL_LINKS } from '../constants';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
             <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop" 
                alt="Contacto Background" 
                className="w-full h-full object-cover"
            />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contáctanos</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                ¿Tienes alguna duda o quieres participar? Estamos aquí para ayudarte.
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Info Card */}
            <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8 lg:p-10 flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-green-600 rounded-full opacity-20 filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600 rounded-full opacity-20 filter blur-3xl"></div>
                
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-8">Información de Contacto</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-lg shrink-0">
                                <Icons.MapPin className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-200">Ubicación</h4>
                                <p className="text-gray-400 text-sm mt-1">Iquique, Región de Tarapacá, Chile.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-lg shrink-0">
                                <Icons.Mail className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-200">Email</h4>
                                <p className="text-gray-400 text-sm mt-1">contacto@coresemintarapaca.cl</p>
                            </div>
                        </div>

                         <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-lg shrink-0">
                                <Icons.Users className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-200">Redes Sociales</h4>
                                <div className="flex gap-4 mt-3">
                                    <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors"><Icons.Facebook className="w-5 h-5"/></a>
                                    <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors"><Icons.Twitter className="w-5 h-5"/></a>
                                    <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors"><Icons.Instagram className="w-5 h-5"/></a>
                                    <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors"><Icons.Linkedin className="w-5 h-5"/></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Envíanos un mensaje</h3>
                <p className="text-gray-500 mb-8">Completa el formulario y te responderemos a la brevedad.</p>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Icons.Check className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">¡Mensaje Enviado!</h4>
                        <p className="text-gray-600">Gracias por contactarnos. Nos pondremos en comunicación contigo pronto.</p>
                        <button 
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-sm font-semibold text-green-700 hover:text-green-800 underline"
                        >
                            Enviar otro mensaje
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="¿Sobre qué quieres hablar?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                                placeholder="Escribe tu mensaje aquí..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full md:w-auto px-8 py-3 rounded-lg text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: CORE_COLOR }}
                        >
                            {status === 'submitting' ? (
                                <>Enviando...</>
                            ) : (
                                <><Icons.Send className="w-5 h-5" /> Enviar Mensaje</>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Quick Fix: Check icon was missing in Icons.tsx, adding a local one if needed or relying on general Icons. However, for consistency I will assume I can use one from lucide-react inside Icons component if I added it, but I added Mail, Phone, Send. 
// I will reuse Icons.ShieldCheck for success or just plain Check if I added it. I didn't add Check. I'll use ShieldCheck as a checkmark or add Check to Icons.tsx.
// Let's modify Icons.tsx to include Check to be safe, but since I already outputted the XML for Icons.tsx, I will modify Contact.tsx to use ShieldCheck which looks like a checkmark.
// Actually, I can just update the Icons.tsx change block above to include 'Check'. 
// RETRYING Icons.tsx change block to include Check.

export default Contact;