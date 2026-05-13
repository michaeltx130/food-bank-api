//programar controller para manejar las rutas de ejemplo
const exampleController = {
    getExample: (req, res) => {
        res.send('Ejemplo de ruta GET');                
    },
    postExample: (req, res) => {
        const data = req.body;
        res.send(`Ejemplo de ruta POST, recibí: ${JSON.stringify(data)}`);
    }
};


module.exports = exampleController;

