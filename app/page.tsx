'use client';

export default function CarreraMasterform() {
  return (
    <main className="min-h-screen relative bg-[#EAD7B8] text-[#3E2723] font-serif selection:bg-[#8B4513] selection:text-[#EAD7B8] pb-10 overflow-x-hidden flex items-center justify-center p-4">
      
      {/* FONDO TEXTURIZADO (Puntos) */}
      <div className="fixed inset-0 opacity-40 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#8B4513 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }}></div>

      {/* LOGO SUPERIOR */}
      <div className="absolute top-6 left-4 md:top-8 md:left-8 z-50">
        <img 
          src="/logo.png" 
          alt="Logo del Gym" 
          className="h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-[2px_2px_0px_rgba(62,39,35,0.5)]" 
        />
      </div>

      {/* CONTENEDOR PRINCIPAL TIPO TARJETA VAQUERA */}
      <div className="relative z-10 w-full max-w-4xl bg-[#F5E8D3] border-[6px] md:border-[12px] border-[#8B4513] shadow-[8px_8px_0px_0px_#1A0F0D] md:shadow-[16px_16px_0px_0px_#1A0F0D] flex flex-col p-6 sm:p-10 md:p-16 text-center animate-fade-in mt-20 md:mt-0">
        
        {/* ESQUINEROS DECORATIVOS */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-[#3E2723] z-30 pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-[#3E2723] z-30 pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-[#3E2723] z-30 pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-[#3E2723] z-30 pointer-events-none"></div>

        {/* ENCABEZADO: MISIÓN CUMPLIDA */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-2xl text-[#8B4513]">★</span>
          <span className="text-[#8B4513] font-black tracking-widest uppercase text-sm md:text-base border-y-2 border-[#8B4513] py-1">Temporada 2026</span>
          <span className="text-2xl text-[#8B4513]">★</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#3E2723] leading-none mb-6" style={{ textShadow: '3px 3px 0px #C7A985' }}>
          MISIÓN <br /> <span className="inline-block mt-2 border-y-4 border-[#3E2723] py-2">CUMPLIDA</span>
        </h1>

        <p className="text-[#5D4037] text-base md:text-xl font-bold uppercase tracking-widest mb-10 max-w-2xl mx-auto leading-relaxed">
          La <span className="font-black text-[#8B4513]">Cowboy Run</span> ha concluido con éxito. ¡Gracias a todos los vaqueros y vaqueras por su esfuerzo, energía y dedicación!
        </p>

        {/* AGRADECIMIENTO A PUNTO FIT */}
        <div className="w-full bg-[#DFCAAA] border-4 border-[#3E2723] p-6 md:p-8 mb-12 shadow-[4px_4px_0px_0px_rgba(62,39,35,1)] transform hover:-translate-y-1 transition-transform">
          <h2 className="text-xl md:text-2xl font-black text-[#8B4513] mb-3 uppercase tracking-widest flex items-center justify-center gap-3">
            <span>🤠</span> Agradecimiento Especial <span>🤠</span>
          </h2>
          <p className="text-[#3E2723] font-bold text-sm md:text-lg uppercase leading-relaxed">
            Un enorme reconocimiento a <br className="md:hidden" />
            <span className="font-black text-2xl md:text-3xl block mt-2 text-[#8B4513]" style={{ textShadow: '1px 1px 0px #F5E8D3' }}>PUNTO FIT GYM & FITNESS</span>
            <span className="block mt-2">por ser el motor de este evento y continuar fomentando el deporte en el Valle de Mexicali.</span>
          </p>
        </div>

        {/* INFORMACIÓN DEL DESARROLLADOR */}
        <div className="border-t-4 border-[#3E2723] pt-10 mt-auto">
          <p className="text-[10px] md:text-xs text-[#8B4513] font-black uppercase tracking-widest mb-3">
            Plataforma diseñada y desarrollada por:
          </p>
          <h3 className="text-2xl md:text-4xl font-black text-[#3E2723] uppercase tracking-wider mb-3">
            Luis Fernando Espinoza Diaz
          </h3>
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-bold text-[#5D4037] uppercase tracking-widest">
              Estudiante de Licenciatura en Sistemas Computacionales
            </p>
            <p className="text-xs md:text-sm font-bold text-[#8B4513] uppercase tracking-widest">
              Universidad Autónoma de Baja California (UABC)
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}