import { producer } from './config';
import { BancadaInterface } from './bancadaInterface';

class Bancada implements BancadaInterface {
  id: number;
  temperatura: number;
  umidade: number;
  condutividade: number;

  constructor(id: number) {
    this.id = id;
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
  }

  updateData(): void {
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
  }
}

const producerBancada = (async (): Promise<void> => {
  try {
    await producer.connect();
    const bancada = new Bancada(2);  
    setInterval(async () => {
      bancada.updateData();
      const data: BancadaInterface = {
        id: bancada.id,
        temperatura: bancada.temperatura,
        umidade: bancada.umidade,
        condutividade: bancada.condutividade,
      };

      await producer.send({
        topic: 'bancada-data',
        messages: [
          {
            key: `bancada-${bancada.id}`,
            value: JSON.stringify(data),
          },
        ],
      });
      console.log(`Bancada ${bancada.id} sent data:`, data);
    }, 5000);  
  } catch (error) {
    console.error(`Error in bancada ${2}:`, error);
  }
})();

export default producerBancada;