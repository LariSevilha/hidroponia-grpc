import { Kafka, KafkaConfig, Producer, Consumer } from 'kafkajs';

const config: KafkaConfig = {
  brokers: ['localhost:9092'],  
};

const kafka = new Kafka(config);

const producer: Producer = kafka.producer();
const consumer: Consumer = kafka.consumer({ groupId: 'bancada-group' });

export {
  producer,
  consumer,
};