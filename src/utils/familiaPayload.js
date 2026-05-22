const familiaInclude = { beneficiario: true };
const beneficiarioInclude = { entregas: true, familia: true };

const normalizarFamiliaPayload = (body) => {
  const rawCantidad = body.cantidad_miembros ?? body.cantidadMiembros ?? body.miembros;
  const rawBeneficiarioId = body.beneficiario_id ?? body.beneficiarioId;
  const cantidad_miembros = rawCantidad === undefined || rawCantidad === null || rawCantidad === ''
    ? null
    : Number(rawCantidad);
  const beneficiario_id = rawBeneficiarioId === undefined || rawBeneficiarioId === null || rawBeneficiarioId === ''
    ? undefined
    : Number(rawBeneficiarioId);

  if (cantidad_miembros !== null && !Number.isInteger(cantidad_miembros)) {
    return {
      valido: false,
      error: 'cantidad_miembros debe ser un numero entero'
    };
  }

  if (beneficiario_id !== undefined && !Number.isInteger(beneficiario_id)) {
    return {
      valido: false,
      error: 'beneficiario_id debe ser un numero entero'
    };
  }

  return {
    valido: true,
    data: {
      beneficiario_id,
      nombre: body.nombre,
      telefono: body.telefono,
      cantidad_miembros,
      direccion: body.direccion ?? body.ubicacion
    }
  };
};

const crearFamiliaConBeneficiario = async (client, familia) => {
  return client.$transaction(async (tx) => {
    let beneficiarioId = familia.data.beneficiario_id;

    if (beneficiarioId === undefined) {
      const beneficiario = await tx.beneficiarios.create({
        data: { nombre: familia.data.nombre }
      });
      beneficiarioId = beneficiario.id;
    } else if (familia.data.nombre !== undefined) {
      await tx.beneficiarios.update({
        where: { id: beneficiarioId },
        data: { nombre: familia.data.nombre }
      });
    }

    return tx.familias.create({
      data: { ...familia.data, beneficiario_id: beneficiarioId },
      include: familiaInclude
    });
  });
};

const actualizarFamiliaConBeneficiario = async (client, id, familia) => {
  return client.$transaction(async (tx) => {
    const existente = await tx.familias.findUnique({
      where: { id },
      select: { beneficiario_id: true }
    });

    const beneficiarioId = familia.data.beneficiario_id ?? existente?.beneficiario_id;
    if (beneficiarioId !== undefined && familia.data.nombre !== undefined) {
      await tx.beneficiarios.update({
        where: { id: beneficiarioId },
        data: { nombre: familia.data.nombre }
      });
    }

    return tx.familias.update({
      where: { id },
      data: familia.data,
      include: familiaInclude
    });
  });
};

module.exports = {
  actualizarFamiliaConBeneficiario,
  beneficiarioInclude,
  crearFamiliaConBeneficiario,
  familiaInclude,
  normalizarFamiliaPayload
};
