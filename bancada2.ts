import { producer } from './config';
import { BancadaInterface } from './bancadaInterface';

class Bancada2 implements BancadaInterface {
  id: number;
  temperatura: number;
  umidade: number;
  condutividade: number;

  constructor() {
    this.id = 2;
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
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
      messages: [
        {
          key: `bancada-${this.id}`,
          value: JSON.stringify(dados),
        },
      ],
    });
    
    console.log(` BANCADA ${this.id} ENVIOU:`, dados);
  }
}

const executarBancada2 = async (): Promise<void> => {
  try {
    await producer.connect();
    console.log(' PRODUCER BANCADA 2 CONECTADO');
    
    const bancada2 = new Bancada2();
    
    setInterval(async () => {
      bancada2.updateData();
      await bancada2.publicarDados();
    }, 3000);
    
  } catch (error) {
    console.error(' Erro na bancada 2:', error);
  }
};

executarBancada2();