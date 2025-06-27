import { Kafka, Producer, Consumer } from 'kafkajs';

// Cria cliente Kafka
const kafka = new Kafka({
  clientId: 'hidroponia-app',
  brokers: ['localhost:9092'], // Broker local
});

// Cria produtor e consumidor
const producer: Producer = kafka.producer();
const consumer: Consumer = kafka.consumer({ groupId: 'hidroponia-group' });

export { kafka, producer, consumer };