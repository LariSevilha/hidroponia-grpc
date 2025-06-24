import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { BancadaInterface } from './bancadaInterface';

// ARMAZENAMENTO DOS DADOS RECEBIDOS
const dadosRecebidos: BancadaInterface[] = [];

// CRIAR E INICIALIZAR O CONSUMER
const kafka = new Kafka({
  clientId: 'hidroponia-consumer',
  brokers: ['localhost:9092'] // ajuste conforme necessário
});
const consumer: Consumer = kafka.consumer({ groupId: 'hidroponia-group' });

// CONSUMER - ESCUTA O TÓPICO E RECEBE DADOS
const executarConsumer = async (): Promise<void> => {
  try {
    await consumer.connect();
    console.log(' CONSUMER CONECTADO');
    
    //  ASSINAR/ESCUTAR O TÓPICO "bancada-data"
    await consumer.subscribe({ 
      topic: 'bancada-data', 
      fromBeginning: true 
    });

    // 🔄 PROCESSAR CADA MENSAGEM RECEBIDA
    await consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          if (message.value) {
            //  CONVERTER DADOS DE JSON PARA OBJETO
            const dados: BancadaInterface = JSON.parse(message.value.toString());
            
            //  ARMAZENAR DADOS RECEBIDOS
            dadosRecebidos.push(dados);
            
            console.log(` CONSUMER RECEBEU de BANCADA ${dados.id}:`, dados);
            console.log(` Tópico: ${topic}, Partição: ${partition}`);
            console.log(` Total de dados recebidos: ${dadosRecebidos.length}`);
            console.log('─'.repeat(50));
          } else {
            console.error('Mensagem sem valor recebida');
          }
        } catch (error) {
          console.error(' Erro ao processar mensagem:', error);
        }
      },
    });
    
  } catch (error) {
    console.error(' Erro no consumer:', error);
  }
};

executarConsumer();

const mostrarResumo = (): void => {
  console.log('\nRESUMO DOS DADOS RECEBIDOS:');
  console.log(`Total de mensagens: ${dadosRecebidos.length}`);
  
  // Agrupar por bancada
  const porBancada = dadosRecebidos.reduce((acc, dados) => {
    if (!acc[dados.id]) acc[dados.id] = [];
    acc[dados.id].push(dados);
    return acc;
  }, {} as Record<number, BancadaInterface[]>);
  
  Object.keys(porBancada).forEach(bancadaId => {
    const dados = porBancada[parseInt(bancadaId)];
    console.log(` Bancada ${bancadaId}: ${dados.length} mensagens`);
  });
  
  console.log('═'.repeat(50));
};

// Mostrar resumo a cada 10 segundos
setInterval(mostrarResumo, 10000);