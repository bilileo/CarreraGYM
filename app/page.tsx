'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../src/lib/supabase';

export default function CarreraMasterform() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({ id: '', nombre: '', correo: '', categoria: '', edad: '' });
  const [eventos, setEventos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  
  const [viewMode, setViewMode] = useState<'register' | 'search_correct' | 'correcting'>('register');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchEdad, setSearchEdad] = useState(''); 
  const [searchError, setSearchError] = useState('');

  // ==========================================
  // ESTADOS PARA EL ANUNCIO INICIAL (WELCOME MODAL)
  // ==========================================
  const [showWelcome, setShowWelcome] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // ESTABLECE AQUÍ LA FECHA Y HORA EXACTA DE LA CARRERA
    const targetDate = new Date('2026-10-10T08:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadEventos() {
      const { data } = await supabase.from('eventos').select('*').order('fecha', { ascending: true });
      if (data) setEventos(data);
    }
    loadEventos();
  }, []);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSearchToCorrect = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSearchError('');

    const { data, error } = await supabase
      .from('participantes')
      .select('*')
      .eq('correo', searchEmail.trim())
      .eq('edad', parseInt(searchEdad)) 
      .single();

    setIsSubmitting(false);

    if (data) {
      setFormData({
        id: data.id,
        nombre: data.nombre,
        correo: data.correo,
        categoria: data.categoria,
        edad: data.edad.toString()
      });
      setViewMode('correcting');
    } else {
      setSearchError('No encontramos ningún registro con ese correo y edad.'); 
    }
  };

  const handlePreSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowDuplicateAlert(false);

    if (viewMode === 'register') {
      const { data: existingUser } = await supabase
        .from('participantes')
        .select('id')
        .ilike('nombre', formData.nombre.trim()) 
        .eq('correo', formData.correo.trim());

      if (existingUser && existingUser.length > 0) {
        setShowDuplicateAlert(true);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    setShowModal(true);
  };

  const confirmAction = async () => {
    setShowModal(false);
    setIsSubmitting(true);

    let response;

    if (viewMode === 'register') {
      response = await supabase
        .from('participantes')
        .insert([{ 
          nombre: formData.nombre, 
          correo: formData.correo, 
          categoria: formData.categoria, 
          edad: parseInt(formData.edad) 
        }])
        .select();
    } else {
      response = await supabase
        .from('participantes')
        .update({
          nombre: formData.nombre,
          categoria: formData.categoria,
          edad: parseInt(formData.edad)
        })
        .eq('id', formData.id)
        .select();
    }

    const { data, error } = response;

    if (!error && data && data.length > 0) {
      setShowToast(true);
      setTimeout(() => {
        router.push(`/exito?id=${data[0].id}`);
      }, 2000);
    } else {
      alert("Error en el sistema: " + error?.message);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-[#EAD7B8] text-[#3E2723] font-serif selection:bg-[#8B4513] selection:text-[#EAD7B8] pb-10 overflow-x-hidden">
      
      <div className="fixed inset-0 opacity-40 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#8B4513 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }}></div>

      {/* ==========================================
          MODAL DE BIENVENIDA / ANUNCIO INICIAL (Optimizada para Móvil)
          ========================================== */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E2723]/95 backdrop-blur-md animate-fade-in overflow-y-auto">
          
          <div className="w-full max-w-5xl bg-[#F5E8D3] border-[6px] md:border-[12px] border-[#8B4513] shadow-[8px_8px_0px_0px_#1A0F0D] md:shadow-[16px_16px_0px_0px_#1A0F0D] flex flex-col md:flex-row relative overflow-hidden my-auto">
            
            <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-[#3E2723] z-20 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-[#3E2723] z-20 pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-[#3E2723] z-20 pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-[#3E2723] z-20 pointer-events-none"></div>

            {/* SECCIÓN IZQUIERDA: CONTADOR Y TEXTO */}
            <div className="flex-1 p-4 sm:p-6 md:p-12 flex flex-col justify-center items-center text-center border-b-4 md:border-b-0 md:border-r-8 border-[#3E2723] z-10 bg-[#F5E8D3]">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#3E2723] leading-none mb-2" style={{ textShadow: '2px 2px 0px #C7A985' }}>
                COWBOY RUN
              </h2>
              <p className="text-[#8B4513] font-black uppercase tracking-widest text-[10px] sm:text-xs md:text-sm mb-4 md:mb-6 border-b-2 border-[#8B4513] pb-2 inline-block">
                Ven a correr 1 y 3km con banda en vivo 🤠🔥
              </p>
              
              <div className="w-full bg-[#DFCAAA] border-4 border-[#3E2723] p-3 sm:p-4 md:p-6 mb-6 md:mb-8 shadow-[4px_4px_0px_0px_rgba(62,39,35,1)]">
                <p className="text-[10px] md:text-xs font-bold text-[#5D4037] uppercase tracking-widest mb-2 md:mb-3">Tiempo para el disparo de salida</p>
                <div className="flex justify-center gap-2 sm:gap-4 md:gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#3E2723]">{timeLeft.days.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-[#8B4513] uppercase">Días</span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#8B4513]">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#3E2723]">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-[#8B4513] uppercase">Horas</span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#8B4513]">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#3E2723]">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-[#8B4513] uppercase">Min</span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#8B4513]">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl md:text-5xl font-black text-[#3E2723]">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-[#8B4513] uppercase">Seg</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowWelcome(false)}
                className="w-full bg-[#3E2723] text-[#EAD7B8] py-3 sm:py-4 md:py-5 font-black uppercase tracking-widest hover:bg-[#8B4513] transition-colors border-4 border-[#3E2723] shadow-[4px_4px_0px_0px_rgba(139,69,19,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 duration-200 text-xs sm:text-sm md:text-base"
              >
                Ingresar al Registro »
              </button>
            </div>

            {/* SECCIÓN DERECHA: GOOGLE MAPS INTERACTIVO */}
            <div className="mt-8 md:mt-12 relative h-64 sm:h-72 w-full bg-[#1A0F0D] border-4 border-[#3E2723] shadow-[8px_8px_0px_0px_rgba(62,39,35,1)]">
            <div className="absolute top-2 left-2 z-20 bg-[#F5E8D3] text-[#3E2723] px-3 py-1 font-black uppercase tracking-widest text-[10px] md:text-xs border-2 border-[#3E2723] pointer-events-none">
              RUTA OFICIAL - 3KM
            </div>
            
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m56!1m12!1m3!1d8669.407081497284!2d-115.0014890404043!3d32.567421751558854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m41!3e2!4m5!1s0x80d7ab56caac1bcb%3A0x6beaf3e36ffd0dbe!2sPunto%20Fit%20Gym%2C%20Av%20mexico%20s%2Fn%2C%20Pob%2C%20Benito%20Ju%C3%A1rez%2C%2021900%20Benito%20Ju%C3%A1rez%2C%20B.C.!3m2!1d32.563155099999996!2d-114.9945485!4m3!3m2!1d32.5697846!2d-114.9990775!4m3!3m2!1d32.5691708!2d-114.9971758!4m3!3m2!1d32.5673136!2d-114.9958171!4m3!3m2!1d32.566692599999996!2d-114.9953716!4m3!3m2!1d32.5661266!2d-114.9949652!4m3!3m2!1d32.564562699999996!2d-114.9938165!4m3!3m2!1d32.5652776!2d-114.994382!4m5!1s0x80d7ab56caac1bcb%3A0x6beaf3e36ffd0dbe!2sPunto%20Fit%20Gym%2C%20Av%20mexico%20s%2Fn%2C%20Pob%2C%20Benito%20Ju%C3%A1rez%2C%2021900%20Benito%20Ju%C3%A1rez%2C%20B.C.!3m2!1d32.563155099999996!2d-114.9945485!5e1!3m2!1ses!2smx!4v1790122956480!5m2!1ses!2smx"                  
              className="w-full h-full border-0 absolute inset-0 z-10" 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(26,15,13,0.8)] pointer-events-none z-20"></div>
          </div>
          </div>
        </div>
      )}

      <div className="absolute top-6 left-4 md:top-8 md:left-8 z-50">
        <img 
          src="/logo.png" 
          alt="Logo del Gym" 
          className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-[2px_2px_0px_rgba(62,39,35,0.5)]" 
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-40 pb-12 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        <div className="space-y-8 mt-4 lg:mt-0">
          <div>
            <div className="flex items-center gap-4">
              <span className="text-2xl">★</span>
              <span className="text-[#8B4513] font-black tracking-widest uppercase text-sm md:text-base border-y-2 border-[#8B4513] py-1">Temporada 2026</span>
              <span className="text-2xl">★</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black uppercase leading-none mt-4 tracking-tighter" style={{ textShadow: '3px 3px 0px #C7A985' }}>
              COWBOY <br /> <span className="inline-block mt-2 border-y-4 border-[#3E2723] py-2">RUN</span>
            </h1>
            <p className="text-[#5D4037] text-sm md:text-lg max-w-md mt-4 md:mt-6 leading-relaxed font-bold">
              DISEÑADO POR <span className="font-black text-[#8B4513]">PUNTO FIT</span> | <span className="font-black text-[#3E2723]">CARRERA 1 Y 3 K</span>
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest border-b-2 border-[#8B4513] inline-block pb-1">Próximos Desafíos</h2>
            <div className="grid gap-2 md:gap-3 mt-2">
              {eventos.map((ev) => (
                <div 
                  key={ev.id} 
                  onClick={() => setShowWelcome(true)} 
                  className="group flex items-center justify-between p-3 md:p-4 bg-[#DFCAAA] border-2 border-[#3E2723] rounded-none hover:bg-[#3E2723] hover:text-[#EAD7B8] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] cursor-pointer" // <-- AQUI SE AGREGO CURSOR-POINTER
                >
                  <div>
                    <p className="font-black uppercase text-sm md:text-base">{ev.titulo}</p>
                    <p className="text-[11px] md:text-xs font-bold opacity-80">{new Date(ev.fecha).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xl group-hover:text-[#EAD7B8] text-[#8B4513]">★</div>
                </div>
              ))}
              {eventos.length === 0 && <p className="text-sm text-[#5D4037] font-bold">Cargando eventos en el condado...</p>}
            </div>
          </div>
        </div>

        <div className="bg-[#F5E8D3] text-[#3E2723] p-6 sm:p-10 lg:p-14 shadow-[8px_8px_0px_0px_rgba(62,39,35,1)] md:shadow-[16px_16px_0px_0px_rgba(62,39,35,1)] border-4 border-[#3E2723] w-[95%] md:w-full max-w-lg mx-auto lg:max-w-none relative">
          
          <div className="absolute top-2 left-2 w-3 h-3 border-t-4 border-l-4 border-[#8B4513]"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-4 border-r-4 border-[#8B4513]"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-4 border-l-4 border-[#8B4513]"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-4 border-r-4 border-[#8B4513]"></div>

          {viewMode === 'search_correct' && (
            <div className="animate-fade-in relative z-10">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-center mb-2">Corregir Datos</h3>
              <p className="text-sm md:text-base text-[#5D4037] mb-6 font-bold text-center border-b-2 border-[#3E2723]/20 pb-4">Ingresa tu correo y edad para buscar tu ficha.</p>
              
              <form onSubmit={handleSearchToCorrect} className="space-y-6">
                <div className="group relative border-b-4 border-[#8B4513] focus-within:border-[#3E2723] transition-all">
                  <label className="block text-xs uppercase font-black text-[#8B4513] group-focus-within:text-[#3E2723]">Tu Email Registrado</label>
                  <input 
                    type="email" required value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full bg-transparent py-2 outline-none text-base md:text-xl font-bold uppercase text-[#3E2723] placeholder-[#3E2723]/40" placeholder="TUEMAIL@GMAIL.COM" 
                  />
                </div>

                <div className="group relative border-b-4 border-[#8B4513] focus-within:border-[#3E2723] transition-all">
                  <label className="block text-xs uppercase font-black text-[#8B4513] group-focus-within:text-[#3E2723]">Tu Edad</label>
                  <input 
                    type="number" required min="1" value={searchEdad} onChange={(e) => setSearchEdad(e.target.value)}
                    onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                    className="w-full bg-transparent py-2 outline-none text-base md:text-xl font-bold uppercase text-[#3E2723] placeholder-[#3E2723]/40" placeholder="EJ. 25" 
                  />
                </div>

                {searchError && <p className="text-red-700 text-xs md:text-sm font-black text-center bg-red-100 p-2 border-2 border-red-700">{searchError}</p>}
                
                <div className="flex flex-col gap-4 mt-8">
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#3E2723] text-[#EAD7B8] py-4 md:py-5 font-black uppercase tracking-widest hover:bg-[#8B4513] transition-colors duration-300 text-sm md:text-base border-2 border-[#3E2723]">
                    {isSubmitting ? 'Rastreando...' : 'Buscar Ficha'}
                  </button>
                  <button type="button" onClick={() => setViewMode('register')} className="w-full bg-[#DFCAAA] text-[#3E2723] py-3 md:py-4 font-black uppercase hover:bg-[#C7A985] transition-colors text-xs md:text-sm border-2 border-[#3E2723]">
                    ← Volver al registro
                  </button>
                </div>
              </form>
            </div>
          )}

          {(viewMode === 'register' || viewMode === 'correcting') && (
            <div className="animate-fade-in relative z-10">
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-center mb-2">
                {viewMode === 'correcting' ? 'Actualizar Ficha' : 'Registro de Atleta'}
              </h3>
              {viewMode === 'correcting' && <p className="text-[#8B4513] font-black text-xs md:text-sm mb-6 break-all text-center">Actualizando a: {formData.correo}</p>}
              {viewMode === 'register' && <div className="mb-6 md:mb-8 border-b-2 border-[#3E2723]/20 w-1/2 mx-auto"></div>}
              
              <form onSubmit={handlePreSubmit} className="space-y-6 md:space-y-8">
                <div className="group relative border-b-4 border-[#8B4513] focus-within:border-[#3E2723] transition-all">
                  <label className="block text-xs uppercase font-black text-[#8B4513] group-focus-within:text-[#3E2723]">Nombre Completo</label>
                  <input 
                    name="nombre" required onChange={handleChange} value={formData.nombre}
                    className="w-full bg-transparent py-2 outline-none text-base md:text-xl font-bold uppercase placeholder-[#3E2723]/40" placeholder="YULISA ESPINOZA" 
                  />
                </div>

                {viewMode === 'register' && (
                  <div className="group relative border-b-4 border-[#8B4513] focus-within:border-[#3E2723] transition-all">
                    <label className="block text-xs uppercase font-black text-[#8B4513] group-focus-within:text-[#3E2723]">Email</label>
                    <input 
                      name="correo" type="email" required onChange={handleChange} value={formData.correo}
                      className="w-full bg-transparent py-2 outline-none text-base md:text-xl font-bold uppercase placeholder-[#3E2723]/40" placeholder="TUEMAIL@GMAIL.COM" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="group relative border-b-4 border-[#8B4513] focus-within:border-[#3E2723] transition-all">
                    <label className="block text-xs uppercase font-black text-[#8B4513] group-focus-within:text-[#3E2723]">Edad</label>
                    <input 
                      name="edad" type="number" required min="1" onChange={handleChange} value={formData.edad}
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      className="w-full bg-transparent py-2 outline-none text-base md:text-xl font-bold uppercase placeholder-[#3E2723]/40" placeholder="25" 
                    />
                  </div>
                  <div className="group relative border-b-4 border-[#8B4513] focus-within:border-[#3E2723] transition-all">
                    <label className="block text-xs uppercase font-black text-[#8B4513] group-focus-within:text-[#3E2723]">Categoría</label>
                    <select 
                      name="categoria" required onChange={handleChange} value={formData.categoria}
                      className="w-full bg-transparent py-2 outline-none text-base md:text-xl font-bold uppercase appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#F5E8D3]">Elegir...</option>
                      <option value="POTRILL@S: 7 - 12 AÑOS" className="bg-[#F5E8D3]">POTRILL@S 7 - 12 AÑOS</option>
                      <option value="POTR@S: 13 - 17 AÑOS" className="bg-[#F5E8D3]">POTR@S 13 - 17 AÑOS</option>
                      <option value="VAQUER@S: 18 - 39 AÑOS" className="bg-[#F5E8D3]">VAQUER@S 18 - 39 AÑOS</option>
                      <option value="VAQUER@S: 40 Y MAS" className="bg-[#F5E8D3]">VAQUER@S 40 Y MÁS</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-[#3E2723] text-[#EAD7B8] py-4 md:py-5 font-black uppercase tracking-widest hover:bg-[#8B4513] transition-colors duration-300 disabled:bg-[#8d7c71] flex justify-center items-center gap-3 text-sm md:text-lg mt-6 border-2 border-[#3E2723]"
                >
                  {isSubmitting ? 'Procesando...' : (viewMode === 'correcting' ? 'Guardar Cambios' : 'Obtener mi número')}
                  {!isSubmitting && <span className="text-xl md:text-2xl">»</span>}
                </button>
              </form>

              {viewMode === 'register' && (
                <div className="mt-8 text-center border-t-2 border-[#3E2723]/20 pt-6">
                  <button onClick={() => setViewMode('search_correct')} className="text-xs md:text-sm font-bold text-[#8B4513] uppercase tracking-widest hover:text-[#3E2723] transition-colors underline decoration-2 underline-offset-4">
                    ¿Ya te registraste y deseas corregir tus datos?
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 w-full text-center mt-16 pb-6 border-t-2 border-[#8B4513]/20 pt-6 max-w-6xl mx-auto px-4">
        <p className="text-xs md:text-sm font-black uppercase tracking-widest text-[#8B4513]">
          Made by <a href="https://github.com/bilileo" target="_blank" rel="noopener noreferrer" className="text-[#3E2723] hover:text-[#8B4513] transition-colors underline decoration-2 underline-offset-4 cursor-pointer">bili © 2026</a>
        </p>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E2723]/90 backdrop-blur-sm">
          <div className="bg-[#F5E8D3] text-[#3E2723] p-6 md:p-10 max-w-sm w-full border-4 border-[#8B4513] shadow-[8px_8px_0px_0px_#271714]">
            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4 text-center">
              {viewMode === 'correcting' ? '¿Guardar Cambios?' : '¿Estás listo?'}
            </h4>
            <p className="text-sm md:text-base text-[#5D4037] mb-8 font-bold text-center">
              {viewMode === 'correcting' ? 'Tu ficha se actualizará con estos nuevos datos.' : 'Confirma que tus datos son correctos para generar tu número de competidor.'}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmAction} className="w-full bg-[#3E2723] hover:bg-[#8B4513] text-[#EAD7B8] py-3 font-black uppercase tracking-widest transition-colors text-sm border-2 border-[#3E2723]">
                Confirmar
              </button>
              <button onClick={() => setShowModal(false)} className="w-full bg-[#DFCAAA] hover:bg-[#C7A985] text-[#3E2723] py-3 font-black uppercase tracking-widest transition-colors text-sm border-2 border-[#3E2723]">
                Revisar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDuplicateAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E2723]/90 backdrop-blur-sm">
          <div className="bg-[#F5E8D3] text-[#3E2723] p-6 md:p-10 max-w-sm w-full border-4 border-red-800 shadow-[8px_8px_0px_0px_#271714]">
            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4 text-red-800 text-center">¡Ya estás registrado!</h4>
            <p className="text-sm md:text-base text-[#5D4037] mb-8 font-bold text-center">
              Detectamos que el corredor <span className="font-black text-[#3E2723]">{formData.nombre}</span> ya tiene un número asignado usando el correo <span className="font-black text-[#3E2723]">{formData.correo}</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowDuplicateAlert(false)} className="w-full bg-red-800 hover:bg-red-900 text-[#EAD7B8] py-3 font-black uppercase tracking-widest transition-colors text-sm border-2 border-red-950">
                Entendido
              </button>
              <button 
                onClick={() => { setShowDuplicateAlert(false); setViewMode('search_correct'); setSearchEmail(formData.correo); setSearchEdad(''); }} 
                className="w-full bg-[#DFCAAA] hover:bg-[#C7A985] text-[#3E2723] py-3 font-black uppercase tracking-widest transition-colors text-sm border-2 border-[#3E2723]"
              >
                Quiero corregir mis datos
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#3E2723] text-[#EAD7B8] px-8 md:px-12 py-4 shadow-[4px_4px_0px_0px_#8B4513] border-2 border-[#8B4513] flex items-center gap-4 animate-bounce w-[90%] md:w-auto justify-center">
          <div className="text-[#8B4513] text-2xl font-black">★</div>
          <span className="font-black uppercase tracking-widest text-sm md:text-base">
            {viewMode === 'correcting' ? '¡Actualizado!' : '¡Registro completado!'}
          </span>
          <div className="text-[#8B4513] text-2xl font-black">★</div>
        </div>
      )}
    </main>
  );
}