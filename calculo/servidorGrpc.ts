import { loadSync } from '@grpc/proto-loader';
import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { consumer } from '../kafka/config';
import { BancadaInterface } from '../producer/bancadaInterface';
import { EachMessagePayload } from 'kafkajs';

const protoDefs = loadSync('./bancada.proto');
const bancadaProto = loadPackageDefinition(protoDefs) as any;
const bancadaDataMap: Map<number, BancadaInterface[]> = new Map();

function somar(lista: number[]) {
  return lista.reduce((a, b) => a + b, 0);
}

function mediana(lista: number[]): number {
  if (lista.length === 0) return 0;
  const ordenado = [...lista].sort((a, b) => a - b);
  const meio = Math.floor(ordenado.length / 2);
  return ordenado.length % 2 !== 0 ? ordenado[meio] : (ordenado[meio - 1] + ordenado[meio]) / 2;
}

function limparTudo() {
  bancadaDataMap.clear();
}

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'bancada-data', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      const data: BancadaInterface = JSON.parse(message.value!.toString());
      if (!bancadaDataMap.has(data.id)) bancadaDataMap.set(data.id, []);
      bancadaDataMap.get(data.id)?.push(data);
    },
  });
})();

const server = new Server();

server.addService(bancadaProto.bancada.BancadaService.service, {
  BuscarBancada: (call: any, callback: (error: Error | null, response: any) => void) => {
    const { porta } = call.request;
    const id = porta - 2999;
    const dados = bancadaDataMap.get(id) || [];

    if (dados.length === 0) return callback(null, { erro: `Sem dados da bancada ${id}` });

    const temperaturas = dados.map(d => d.temperatura);
    const umidades = dados.map(d => d.umidade);
    const condutividades = dados.map(d => d.condutividade);

    callback(null, {
      mediaTemperatura: somar(temperaturas) / temperaturas.length,
      medianaTemperatura: mediana(temperaturas),
      mediaUmidade: somar(umidades) / umidades.length,
      medianaUmidade: mediana(umidades),
      mediaCondutividade: somar(condutividades) / condutividades.length,
      medianaCondutividade: mediana(condutividades),
      temperaturas,
      umidades,
      condutividades,
      bancadaId: id,
      erro: '',
    });
  },
  LimparTudo: (_: unknown, callback: (error: Error | null, response: { mensagem: string }) => void) => {
    limparTudo();
    callback(null, { mensagem: 'Dados limpos com sucesso' });
  },
});

server.bindAsync('0.0.0.0:4000', ServerCredentials.createInsecure(), () => {
  console.log('Servidor gRPC escutando porta 4000');
  server.start();
});