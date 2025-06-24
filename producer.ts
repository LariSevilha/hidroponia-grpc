import { kafka } from './config';

export class Produtor {
  private producer = kafka.producer();
  private nome: string;

  constructor(nome: string) {
    this.nome = nome;
  }

  // Conectar ao Kafka
  async conectar() {
    await this.producer.connect();
    console.log(`${this.nome} (PRODUTOR) conectado!`);
  }

  // ENVIAR dados para um tópico
  async enviarDados(topico: string, dados: any) {
    await this.producer.send({
      topic: topico,           // Para qual "canal" enviar
      messages: [{
        key: this.nome,        // Identificação de quem está enviando
        value: JSON.stringify(dados), // Os dados em formato texto
      }],
    });
    
    console.log(`${this.nome} enviou:`, dados, ` tópico: ${topico}`);
  }

  // Desconectar
  async desconectar() {
    await this.producer.disconnect();
    console.log(`${this.nome} (PRODUTOR) desconectado`);
  }
}