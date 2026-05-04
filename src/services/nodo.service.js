const axios = require('axios');

// Obtener todos los nodos de los envss
const NODOS = [
  process.env.MI_NODO || "http://localhost:3001",
  process.env.NODO_COMONDU || "http://localhost:3001",
  process.env.NODO_LAPAZ || "http://localhost:3002",
  process.env.NODO_LORETO || "http://localhost:3003",
  process.env.NODO_MULEGE || "http://localhost:3004"
].filter((nodo, index, array) => array.indexOf(nodo) === index); // Elimina los duplicados

const NODOS_MAP = {
  comondu: process.env.NODO_COMONDU || "http://localhost:3001",
  lapaz:   process.env.NODO_LAPAZ   || "http://localhost:3002",
  loreto:  process.env.NODO_LORETO  || "http://localhost:3003",
  mulege:  process.env.NODO_MULEGE  || "http://localhost:3004",
};

const MI_NODO = process.env.MI_NODO || "http://localhost:3001";
const BANCO_ID = process.env.BANCO_ID || "default";


const obtenerEstadoNodos = async () => {
  const estados = await Promise.all(
    NODOS.map(async (nodo) => {
      try {
        const response = await axios.get(`${nodo}/status`, { timeout: 3000 });
        return {
          nodo,
          estado: 'activo',
          datos: response.data
        };
      } catch (error) {
        return {
          nodo,
          estado: 'inactivo',
          error: error.message
        };
      }
    })
  );
  return estados;
};

//Sincronizada qWq
// No sirve aun porque faltan los endpoints 
const sincronizarCon = async (endpoint, datos) => {
  try {
    const promesas = NODOS
      .filter(nodo => nodo !== MI_NODO)
      .map(nodo =>
        axios.post(`${nodo}${endpoint}`, datos, { timeout: 5000 })
          .catch(err => ({ error: true, nodo, mensaje: err.message }))
      );
    
    const resultados = await Promise.all(promesas);
    return resultados;
  } catch (error) {
    console.error('Error en sincronización:', error.message);
    return [];
  }
};


const enviarA = async (nodo, endpoint, datos) => {
  console.log(`Enviando a: ${nodo}${endpoint}`); // <-- agrega esto
  try {
    const response = await axios.post(`${nodo}${endpoint}`, datos, { timeout: 5000 });
    return { exito: true, datos: response.data };
  } catch (error) {
    const mensaje = error.response?.data?.error || error.message || error.code || 'No se pudo contactar el nodo';

    return {
      exito: false,
      status: error.response?.status,
      error: mensaje,
      datos: error.response?.data
    };
  }
};


const obtenerDe = async (nodo, endpoint) => {
  try {
    const response = await axios.get(`${nodo}${endpoint}`, { timeout: 5000 });
    return { exito: true, datos: response.data };
  } catch (error) {
    return { exito: false, error: error.message };
  }
};

module.exports = {
  NODOS,
  NODOS_MAP,
  MI_NODO,
  BANCO_ID,
  obtenerEstadoNodos,
  sincronizarCon,
  enviarA,
  obtenerDe
};
