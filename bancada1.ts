import { producer } from './config';
import { BancadaInterface } from './bancadaInterface';

class Bancada1 implements BancadaInterface {
  id: number;
  temperatura: number;
  umidade: number;
  condutividade: number;

  constructor() {
    this.id = 1;
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
  }

  updateData(): void {
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat((Math.random() * (2.5 - 1.2) + 1.2).toFixed(2));
  }

  //  MÉTODO PARA PUBLICAR/ENVIAR DADOS
  async publicarDados(): Promise<void> {
    const dados: BancadaInterface = {
      id: this.id,
      temperatura: this.temperatura,
      umidade: this.umidade,
      condutividade: this.condutividade,
    };

    // ENVIANDO DADOS PARA O TÓPICO "bancada-data"
    await producer.send({
      topic: 'bancada-data',           //  ONDE colocar os dados
      messages: [
        {
          key: `bancada-${this.id}`,   //  IDENTIFICADOR
          value: JSON.stringify(dados), //  DADOS EM JSON
        },
      ],
    });
    
    console.log(` BANCADA ${this.id} ENVIOU:`, dados);
  }
}

// 🔄 EXECUTANDO BANCADA 1 (PRODUCER)
const executarBancada1 = async (): Promise<void> => {
  try {
    await producer.connect();
    console.log(' PRODUCER BANCADA 1 CONECTADO');
    
    const bancada1 = new Bancada1();
    
    // ENVIA DADOS A CADA 3 SEGUNDOS
    setInterval(async () => {
      bancada1.updateData();
      await bancada1.publicarDados();
    }, 3000);
    
  } catch (error) {
    console.error('Erro na bancada 1:', error);
  }
};

executarBancada1();