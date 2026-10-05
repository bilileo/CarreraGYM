'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import Dorsal from '../../../src/components/Dorsal';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: '', nombre: '', correo: '', categoria: '', edad: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [atletaToDelete, setAtletaToDelete] = useState<any>(null);

  // Estados para impresión
  const [corredorAImprimir, setCorredorAImprimir] = useState<any>(null);
  const [impresionMasiva, setImpresionMasiva] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAuthenticated(true);
      setIsCheckingSession(false);
    }
    checkUser();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchParticipantes(true);
    const interval = setInterval(() => { fetchParticipantes(false); }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  async function fetchParticipantes(showSpinner = false) {
    if (showSpinner) setLoading(true);
    const { data } = await supabase.from('participantes').select('*').order('id', { ascending: false });
    if (data) setParticipantes(data);
    if (showSpinner) setLoading(false);
  }

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
    setIsSubmitting(false);
    if (error) {
      setLoginError('Credenciales incorrectas. Intenta de nuevo.');
      setPasswordInput('');
    } else {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmailInput('');
    setPasswordInput('');
  };

  const filtrados = participantes.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  const exportToCSV = () => {
    const headers = ['Numero', 'Nombre', 'Correo', 'Edad', 'Categoria', 'Fecha_Registro'];
    const csvContent = [
      headers.join(','),
      ...filtrados.map(p => {
        const escape = (str: any) => `"${String(str).replace(/"/g, '""')}"`;
        return [escape(getDisplayId(p.id)), escape(p.nombre), escape(p.correo), escape(p.edad), escape(p.categoria), escape(new Date(p.created_at).toLocaleDateString())].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Participantes_CowboyRun_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================
  // FUNCIONES DE IMPRESIÓN
  // =========================================
  
  // Imprimir un solo atleta
  const handlePrintSingle = (atleta: any) => {
    setImpresionMasiva(false);
    setCorredorAImprimir(atleta);
    setTimeout(() => { 
      window.print(); 
      setCorredorAImprimir(null); 
    }, 500);
  };

  // Imprimir TODOS (Formato Tabloide 4 por hoja)
  const handlePrintAll = () => {
    setCorredorAImprimir(null);
    setImpresionMasiva(true);
    
    // Le damos al navegador 2.5 segundos para dibujar todas las imágenes 
    // antes de llamar a la ventana de impresión
    setTimeout(() => { 
      window.print(); 
      setImpresionMasiva(false); 
    }, 2500); 
  };

  const openEditModal = (atleta: any) => {
    setEditData({ id: atleta.id, nombre: atleta.nombre, correo: atleta.correo, categoria: atleta.categoria, edad: atleta.edad.toString() });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    if (!editData.nombre.trim() || !editData.correo.trim() || !editData.categoria || !editData.edad) { alert('Error: Todos los campos son obligatorios.'); return; }
    if (parseInt(editData.edad) <= 0) { alert('Error: La edad debe ser mayor a 0.'); return; }
    setIsSubmitting(true);
    const { error } = await supabase.from('participantes').update({ nombre: editData.nombre, correo: editData.correo, categoria: editData.categoria, edad: parseInt(editData.edad) }).eq('id', editData.id);
    setIsSubmitting(false);
    if (error) alert('Error al actualizar: ' + error.message);
    else { setShowEditModal(false); fetchParticipantes(false); }
  };

  const openDeleteModal = (atleta: any) => {
    setAtletaToDelete(atleta);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.from('participantes').delete().eq('id', atletaToDelete.id);
    setIsSubmitting(false);
    if (error) alert('Error al eliminar: ' + error.message);
    else { setShowDeleteModal(false); setAtletaToDelete(null); fetchParticipantes(false); }
  };

  const getDisplayId = (id: any) => {
    if (typeof id === 'number') return id.toString().padStart(3, '0');
    if (typeof id === 'string') return id.substring(0, 4).toUpperCase();
    return id;
  };

  // Función para dividir arreglo en grupos de 4 (Para las hojas Tabloide)
  const chunkArray = (arr: any[], size: number) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) chunked.push(arr.slice(i, i + size));
    return chunked;
  };

  const atletasChunks = chunkArray(filtrados, 4);

  if (isCheckingSession) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-500 font-bold">Verificando seguridad...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Correo electrónico" className="w-full bg-gray-50 border border-gray-300 text-slate-900 rounded-lg p-3 outline-none" required />
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña" className="w-full bg-gray-50 border border-gray-300 text-slate-900 rounded-lg p-3 outline-none" required />
            {loginError && <p className="text-red-500 text-sm font-bold text-center">{loginError}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">Entrar al Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      
      {/* CSS DE IMPRESIÓN DINÁMICO */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { 
            size: ${impresionMasiva ? '11in 17in' : 'landscape'}; 
            margin: ${impresionMasiva ? '0.5in' : '0mm'}; 
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          #admin-dashboard, #modals-container, #loading-overlay { display: none !important; }
          #print-section { 
            display: block !important; 
            position: relative !important;
            opacity: 1 !important;
            z-index: auto !important;
          }
        }
      `}} />

      {/* PANTALLA DE CARGA MIENTRAS SE ARMA EL PDF */}
      {impresionMasiva && (
        <div id="loading-overlay" className="fixed inset-0 z-[200] bg-slate-900/95 flex flex-col items-center justify-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
          <h2 className="text-3xl font-bold mb-2">Generando tabloides - by bili...</h2>
          <p className="text-slate-300 text-lg">Espera un momento, el documento PDF se abrirá en breve.</p>
        </div>
      )}

      {/* SECCIÓN DE IMPRESIÓN (Oculta en pantalla, visible al imprimir) */}
      <div 
        id="print-section" 
        className={(impresionMasiva || corredorAImprimir) ? "block absolute top-0 left-0 w-full opacity-0 -z-50" : "hidden"}
      >
        {/* MODO 1: IMPRESIÓN INDIVIDUAL */}
        {corredorAImprimir && !impresionMasiva && (
          <div className="flex items-center justify-center w-[100vw] h-[100vh]">
            <div className="h-[95vh] w-[95vh] max-w-full flex items-center justify-center">
              <Dorsal atleta={corredorAImprimir} />
            </div>
          </div>
        )}

        {/* MODO 2: IMPRESIÓN TABLOIDE (4 POR PÁGINA) */}
        {impresionMasiva && atletasChunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="w-[10in] h-[16in] mx-auto grid grid-cols-2 grid-rows-2 gap-[0.2in] pb-4" style={{ pageBreakAfter: 'always' }}>
            {chunk.map((atleta: any) => (
              <div key={atleta.id} className="w-full h-full flex flex-col justify-center border-[1px] border-dashed border-gray-300 p-2">
                {/* Contenedor cuadrado perfecto para el dorsal */}
                <div className="w-full aspect-square relative">
                  <Dorsal atleta={atleta} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* PANEL DE ADMINISTRACIÓN */}
      <div id="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Panel de Control - COWBOY RUN</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Atletas</span>
              <span className="text-xl font-bold text-blue-600">{participantes.length}</span>
            </div>
            
            {/* AQUÍ ESTÁ EL BOTÓN DE IMPRIMIR TABLOIDES */}
            <button onClick={handlePrintAll} disabled={filtrados.length === 0 || impresionMasiva} className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
              Imprimir Tabloides ({filtrados.length})
            </button>

            <button onClick={exportToCSV} className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-3 rounded-lg text-sm font-semibold transition-colors">
              Exportar Excel
            </button>

            <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-3 rounded-lg text-sm font-semibold transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* ... Buscador y Tabla se mantienen igual ... */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <input type="text" placeholder="Buscar por nombre, correo o número..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-lg p-3 outline-none" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Cargando base de datos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Num</th>
                    <th className="px-6 py-4 font-semibold">Atleta</th>
                    <th className="px-6 py-4 font-semibold hidden md:table-cell">Correo</th>
                    <th className="px-6 py-4 font-semibold hidden sm:table-cell">Categoría</th>
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtrados.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No se encontraron registros.</td></tr>
                  ) : (
                    filtrados.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap"><span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded border border-slate-200">#{getDisplayId(p.id)}</span></td>
                        <td className="px-6 py-4 font-medium text-slate-900 uppercase">{p.nombre}</td>
                        <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{p.correo}</td>
                        <td className="px-6 py-4 text-slate-600 hidden sm:table-cell uppercase text-xs font-semibold">{p.categoria} ({p.edad} años)</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(p)} className="bg-blue-50 text-blue-600 px-3 py-2 rounded text-xs font-semibold">Editar</button>
                            <button onClick={() => openDeleteModal(p)} className="bg-red-50 text-red-600 px-3 py-2 rounded text-xs font-semibold">Borrar</button>
                            <button onClick={() => handlePrintSingle(p)} className="bg-slate-900 text-white px-3 py-2 rounded text-xs font-semibold">Imprimir</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modales de Edición y Eliminación (se mantienen igual que en la versión anterior) */}
      <div id="modals-container">
        {/* Modal Editar */}
        {showEditModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Modificar Registro</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre</label>
                  <input type="text" required value={editData.nombre} onChange={e => setEditData({...editData, nombre: e.target.value})} className="w-full border border-gray-300 rounded p-2 uppercase text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Correo</label>
                  <input type="email" required value={editData.correo} onChange={e => setEditData({...editData, correo: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Edad</label>
                    <input type="number" required min="1" value={editData.edad} onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }} onChange={e => setEditData({...editData, edad: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoría</label>
                    <select required value={editData.categoria} onChange={e => setEditData({...editData, categoria: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm uppercase">
                      <option value="POTRILL@S: 7 - 12 AÑOS">POTRILL@S 7 - 12 AÑOS</option>
                      <option value="POTR@S: 13 - 17 AÑOS">POTR@S 13 - 17 AÑOS</option>
                      <option value="VAQUER@S: 18 - 39 AÑOS">VAQUER@S 18 - 39 AÑOS</option>
                      <option value="VAQUER@S: 40 Y MAS">VAQUER@S 40 Y MÁS</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-2 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-red-200 max-w-sm w-full p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">¿Eliminar registro?</h3>
              <p className="text-sm text-slate-500 mb-6">Estás a punto de borrar a <span className="font-bold text-slate-800">{atletaToDelete?.nombre}</span>. Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => {setShowDeleteModal(false); setAtletaToDelete(null);}} className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-2 rounded-lg font-semibold text-sm transition-colors">Cancelar</button>
                <button type="button" onClick={confirmDelete} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Borrando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}