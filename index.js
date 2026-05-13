require('dotenv').config();
const app = require('./src/app');
const { iniciarConsumidorKafka } = require('./src/events/kafka/kafka.service');

const PORT = process.env.PORT || 3001;
const BANCO_NAME = process.env.BANCO_NAME || 'Banco';
const MI_NODO = process.env.MI_NODO || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`\n${BANCO_NAME} iniciado`);
  console.log(`URL: ${MI_NODO}`);
  console.log(`Puerto: ${PORT}\n`);

  iniciarConsumidorKafka()
    .then((resultado) => {
      if (resultado.iniciado) {
        console.log(`Kafka conectado: ${resultado.brokers.join(', ')}`);
      }
    })
    .catch((error) => {
      console.error(`Kafka no iniciado: ${error.message}`);
    });
});
