const DEFAULT_PRODUCT_UNIT = 'pz';
const PRODUCT_UNITS = ['kg', 'g', 'L', 'ml', 'pz', 'caja', 'paquete'];
const PRODUCT_UNIT_SET = new Set(PRODUCT_UNITS);

const validarUnit = (unit) => {
  const valor = typeof unit === 'string' ? unit.trim() : unit;

  if (typeof valor !== 'string' || valor.length === 0) {
    return { valido: false, error: 'El campo unit no puede estar vacio' };
  }

  if (!PRODUCT_UNIT_SET.has(valor)) {
    return {
      valido: false,
      error: `unit debe ser uno de: ${PRODUCT_UNITS.join(', ')}`
    };
  }

  return { valido: true, valor };
};

const unitParaCrear = (unit) => {
  if (unit === undefined) {
    return { valido: true, valor: DEFAULT_PRODUCT_UNIT };
  }

  return validarUnit(unit);
};

const unitParaActualizar = (unit) => {
  if (unit === undefined) {
    return { valido: true, valor: undefined };
  }

  return validarUnit(unit);
};

module.exports = {
  DEFAULT_PRODUCT_UNIT,
  PRODUCT_UNITS,
  validarUnit,
  unitParaCrear,
  unitParaActualizar
};
