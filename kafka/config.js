"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumer = exports.producer = exports.kafka = void 0;
const kafkajs_1 = require("kafkajs");
// Cria cliente Kafka
const kafka = new kafkajs_1.Kafka({
    clientId: 'hidroponia-app',
    brokers: ['localhost:9092'], // Broker local
});
exports.kafka = kafka;
// Cria produtor e consumidor
const producer = kafka.producer();
exports.producer = producer;
const consumer = kafka.consumer({ groupId: 'hidroponia-group' });
exports.consumer = consumer;
