'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabase';

function ExitoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  const [participante, setParticipante] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }

    async function fetchAtleta() {
      const { data, error } = await supabase
        .from('participantes')
        .select('*')
        .eq('id', id)
        .single();

      if (data) setParticipante(data);
      setLoading(false);
    }

    fetchAtleta();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAD7B8] flex items-center justify-center text-[#3E2723] font-serif font-black uppercase tracking-widest animate-pulse text-xl md:text-2xl">
        Preparando tu ficha...
      </div>
    );
  }

  if (!participante) {
    return (
      <div className="min-h-screen bg-[#EAD7B8] flex flex-col items-center justify-center text-[#3E2723] font-serif space-y-6">
        <p className="font-black text-2xl uppercase tracking-widest">No se encontró el registro.</p>
        <button 
          onClick={() => router.push('/')} 
          className="bg-[#3E2723] text-[#EAD7B8] px-8 py-3 uppercase font-black tracking-widest border-2 border-[#3E2723] hover:bg-[#8B4513] transition-colors shadow-[6px_6px_0px_0px_rgba(62,39,35,1)]"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const displayId = typeof participante.id === 'number' 
    ? participante.id.toString().padStart(3, '0') 
    : participante.id.toString().substring(0, 4).toUpperCase();

  return (
    <main className="min-h-screen relative bg-[#EAD7B8] text-[#3E2723] font-serif flex flex-col items-center justify-center p-6 selection:bg-[#8B4513] selection:text-[#EAD7B8] overflow-hidden">
      
      {/* TEXTURA DE PAPEL VIEJO */}
      <div className="fixed inset-0 opacity-40 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#8B4513 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }}></div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative z-10 w-full max-w-2xl animate-fade-in flex flex-col items-center">
        
        {/* MENSAJE DE ÉXITO */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <span className="text-2xl text-[#8B4513]">★</span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#3E2723]" style={{ textShadow: '2px 2px 0px #C7A985' }}>
              ¡Registro Exitoso!
            </h1>
            <span className="text-2xl text-[#8B4513]">★</span>
          </div>
          <p className="text-[#5D4037] max-w-md mx-auto mt-4 font-bold md:text-lg border-b-2 border-[#8B4513]/30 pb-6">
            Bienvenido a la competencia. Tu lugar está asegurado. Los organizadores tendrán tu número oficial impreso listo para el día del evento.
          </p>
        </div>

        {/* TICKET DIGITAL (Visualización del registro) */}
        <div className="bg-[#F5E8D3] w-full border-4 border-[#3E2723] flex flex-col shadow-[12px_12px_0px_0px_rgba(62,39,35,1)] relative overflow-hidden mb-10">
          
          {/* Adornos en las esquinas */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-[#8B4513]"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-[#8B4513]"></div>
          
          {/* Cabecera del Ticket */}
          <div className="flex justify-between items-center border-b-4 border-[#8B4513] p-6 bg-[#DFCAAA]">
            <img src="/logo.png" alt="Punto Fit" className="h-16 md:h-20 object-contain drop-shadow-[2px_2px_0px_rgba(62,39,35,0.5)]" />
            <div className="text-right">
              <h2 className="text-3xl md:text-4xl font-black uppercase leading-none tracking-tighter">COWBOY</h2>
              <h2 className="text-3xl md:text-4xl font-black uppercase leading-none border-t-4 border-[#3E2723] mt-1 pt-1 tracking-tighter">RUN</h2>
            </div>
          </div>

          {/* Número Gigante */}
          <div className="py-10 flex flex-col items-center justify-center bg-[#F5E8D3] relative">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#8B4513] mb-2">Tu Número de Atleta</p>
            <span className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-[#3E2723]" style={{ textShadow: '4px 4px 0px #C7A985' }}>
              {displayId}
            </span>
          </div>

          {/* Pie del Ticket */}
          <div className="bg-[#3E2723] text-[#EAD7B8] p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-t-4 border-[#3E2723]">
            <div className="w-full md:w-auto overflow-hidden">
              <p className="text-[10px] md:text-xs font-bold text-[#C7A985] uppercase tracking-widest mb-1">Nombre del Corredor</p>
              <p className="text-xl md:text-2xl font-black uppercase truncate">{participante.nombre}</p>
            </div>
            <div className="w-full md:w-auto md:text-right border-t-2 border-[#5D4037] pt-2 md:border-0 md:pt-0">
              <p className="text-[10px] md:text-xs font-bold text-[#C7A985] uppercase tracking-widest mb-1">Categoría Asignada</p>
              <p className="text-lg md:text-xl font-black uppercase text-[#DFCAAA]">{participante.categoria}</p>
            </div>
          </div>
        </div>

        {/* BOTÓN DE FINALIZAR */}
        <button 
          onClick={() => router.push('/')} 
          className="bg-[#3E2723] text-[#EAD7B8] px-10 py-4 font-black uppercase tracking-widest hover:bg-[#8B4513] transition-colors border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_rgba(62,39,35,1)] flex items-center gap-3 text-sm md:text-base"
        >
          Volver al Inicio <span className="text-xl leading-none">»</span>
        </button>

      </div>
    </main>
  );
}

export default function CarreraExito() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EAD7B8] text-[#3E2723] font-serif flex items-center justify-center font-black uppercase tracking-widest text-2xl">
        Cargando...
      </div>
    }>
      <ExitoContent />
    </Suspense>
  );
}