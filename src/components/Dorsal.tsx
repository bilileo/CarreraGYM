export default function Dorsal({ atleta }: { atleta: any }) {
  // Función para formatear el ID
  const displayId = typeof atleta.id === 'number' 
    ? atleta.id.toString().padStart(3, '0') 
    : atleta.id.toString().substring(0, 4).toUpperCase();

  return (
    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden border-[16px] border-white shadow-[0_0_0_4px_#3E2723]">
      {/* Esquinas decorativas */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-8 border-l-8 border-[#8B4513]"></div>
      <div className="absolute top-3 right-3 w-6 h-6 border-t-8 border-r-8 border-[#8B4513]"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start pt-10 px-10 pb-4 border-b-8 border-[#3E2723] bg-white z-10">
        <div className="border-2 border-[#DFCAAA] bg-[#F5E8D3]/30 p-2">
          <img src="/logo.png" alt="Logo" className="h-20 object-contain drop-shadow-md" />
        </div>
        <div className="text-right text-[#3E2723]">
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter border-b-4 border-[#3E2723] pb-2">COWBOY</h2>
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter pt-2 border-b-4 border-[#3E2723] pb-1">RUN</h2>
        </div>
      </div>
      
      {/* Cuerpo con Número */}
      <div className="flex-grow flex flex-col items-center justify-center bg-white z-10">
        <p className="text-xl font-black uppercase tracking-[0.4em] text-[#8B4513] mb-4">Número de Atleta</p>
        <span className="text-[200px] font-black tracking-tighter leading-none text-[#3E2723]" style={{ textShadow: '6px 6px 0px #DFCAAA' }}>
          {displayId}
        </span>
      </div>
      
      {/* Footer */}
      <div className="bg-[#3E2723] text-[#EAD7B8] px-10 py-6 flex justify-between items-center border-t-8 border-[#3E2723] z-10">
        <div className="flex-1 pr-6">
          <p className="text-xs font-bold text-[#C7A985] uppercase tracking-[0.2em] mb-1">Nombre</p>
          <p className="text-3xl font-black uppercase text-white leading-none line-clamp-2">{atleta.nombre}</p>
        </div>
        <div className="text-right border-l-2 border-[#5D4037] pl-6 whitespace-nowrap">
          <p className="text-xs font-bold text-[#C7A985] uppercase tracking-[0.2em] mb-1">Categoría</p>
          <p className="text-3xl font-black uppercase text-white leading-none">{atleta.categoria}</p>
        </div>
      </div>
    </div>
  );
}