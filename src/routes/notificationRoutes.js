const express = require("express");
const {
  limpiar,
  marcarLeida,
  marcarLeidas,
  obtenerNotificaciones,
  obtenerResumen,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", obtenerNotificaciones);
router.get("/resumen", obtenerResumen);
router.patch("/:id/leida", marcarLeida);
router.patch("/leidas", marcarLeidas);
router.delete("/", limpiar);

module.exports = router;
