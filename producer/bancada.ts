import { producer } from '../kafka/config';
import { BancadaInterface } from './bancadaInterface';

export class Bancada implements BancadaInterface {
  id: number;
  temperatura!: number;
  umidade!: number;
  condutividade!: number;

  constructor(id: number) {
    this.id = id;
    this.updateData();
  }

  updateData(): void {
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
  }

  async publicarDados(): Promise<void> {
    const dados: BancadaInterface = {
      id: this.id,
      temperatura: this.temperatura,
      umidade: this.umidade,
      condutividade: this.condutividade,
    };

    await producer.send({
      topic: 'bancada-data',
      messages: [{
        key: `bancada-${this.id}`,
        value: JSON.stringify(dados),
      }],
    });

    console.log(`BANCADA ${this.id} ENVIOU:`, dados);
  }
} 