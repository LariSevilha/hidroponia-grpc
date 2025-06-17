import { loadSync } from "@grpc/proto-loader";
import {
  loadPackageDefinition,
  Server,
  ServerUnaryCall,
  ServerCredentials,
  sendUnaryData,
} from "@grpc/grpc-js";
import { consumer } from "./config";
import { BancadaInterface } from "./bancadaInterface";
import { EachMessagePayload } from "kafkajs";

const protoDefs = loadSync("./bancada.proto");
const bancadaProto = loadPackageDefinition(protoDefs) as any;

const bancadaDataMap: { [key: number]: BancadaInterface[] } = {};

function somarLista(lista: number[]): number {
  return lista.reduce((acc, val) => acc + val, 0);
}

function calcularMediana(lista: number[]): number {
  if (lista.length === 0) return 0;
  const listaOrdenada = [...lista].sort((a, b) => a - b);
  const meio = Math.floor(listaOrdenada.length / 2);
  return listaOrdenada.length % 2 !== 0
    ? listaOrdenada[meio]
    : (listaOrdenada[meio - 1] + listaOrdenada[meio]) / 2;
}

function limparTudo() {
  for (const key in bancadaDataMap) {
    delete bancadaDataMap[key];
  }
}

const runConsumer = (async (): Promise<void> => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "bancada-data", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload): Promise<void> => {
        try {
          const data: BancadaInterface = JSON.parse(message.value!.toString());
          if (!bancadaDataMap[data.id]) {
            bancadaDataMap[data.id] = [];
          }
          bancadaDataMap[data.id].push(data);
          console.log(`Received data for bancada ${data.id}:`, data);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });
  } catch (error) {
    console.error("Error in consumer:", error);
  }
})();

const grpcServer = new Server();

grpcServer.addService(bancadaProto.bancada.BancadaService.service, {
  BuscarBancada: (
    call: ServerUnaryCall<{ ip: string; porta: number }, any>,
    callback: sendUnaryData<any>
  ) => {
    const { ip, porta } = call.request;
    const bancadaId = parseInt(porta.toString()) - 2999;

    const bancadaData = bancadaDataMap[bancadaId] || [];
    if (bancadaData.length === 0) {
      callback(null, {
        erro: `Nenhum dado encontrado para bancada ${bancadaId}`,
      });
      return;
    }

    const temperaturas = bancadaData.map((d) => d.temperatura);
    const umidades = bancadaData.map((d) => d.umidade);
    const condutividades = bancadaData.map((d) => d.condutividade);

    const estatisticas = {
      mediaTemperatura: somarLista(temperaturas) / temperaturas.length,
      medianaTemperatura: calcularMediana(temperaturas),
      mediaUmidade: somarLista(umidades) / umidades.length,
      medianaUmidade: calcularMediana(umidades),
      mediaCondutividade: somarLista(condutividades) / condutividades.length,
      medianaCondutividade: calcularMediana(condutividades),
      temperaturas,
      umidades,
      condutividades,
      bancadaId,
      erro: "",
    };

    callback(null, estatisticas);
  },

  LimparTudo: (
    _: ServerUnaryCall<{}, any>,
    callback: sendUnaryData<{ mensagem: string }>
  ) => {
    limparTudo();
    callback(null, { mensagem: "Dados limpos com sucesso" });
  },
});

grpcServer.bindAsync("0.0.0.0:4000", ServerCredentials.createInsecure(), () => {
  console.log("Servidor gRPC escutando na porta 4000");
  grpcServer.start();
});
