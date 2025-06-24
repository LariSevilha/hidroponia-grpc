// Importa as classes necessárias do kafkajs
import { Kafka, Producer, Consumer } from 'kafkajs';

// Cria uma instância do Kafka com os brokers configurados
const kafka = new Kafka({
clientId: 'hidroponia-app',
brokers: ['localhost:9092'], // Endereço do broker Kafka
});

// Cria uma instância do produtor
const producer: Producer = kafka.producer();

// Cria uma instância do consumidor com um grupo específico
const consumer: Consumer = kafka.consumer({ groupId: 'hidroponia-group' });

// Exporta as instâncias para uso em outros módulos
export { kafka, producer, consumer };