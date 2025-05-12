import { loadSync } from "@grpc/proto-loader";
import {
  loadPackageDefinition,
  Server,
  ServerUnaryCall,
  ServerCredentials,
  sendUnaryData,
} from "@grpc/grpc-js";
import * as net from "net";

// Carregar definição proto
const protoDefs = loadSync("./bancada.proto");
const bancadaProto = loadPackageDefinition(protoDefs) as any;

// Listas para armazenar os dados
let temperaturaBancadas: number[] = [];
let umidadeBancadas: number[] = [];
let condutividadeBancadas: number[] = [];

// Funções auxiliares
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
  temperaturaBancadas = [];
  umidadeBancadas = [];
  condutividadeBancadas = [];
}

// Interface para tipar os dados da bancada recebidos via TCP
interface BancadaData {
  id: number;
  temperatura: number;
  umidade: number;
  condutividade: number;
}

// Servidor gRPC
const grpcServer = new Server();

grpcServer.addService(bancadaProto.bancada.BancadaService.service, {
  BuscarBancada: (
    call: ServerUnaryCall<{ ip: string; porta: number }, any>,
    callback: sendUnaryData<any>
  ) => {
    const { ip, porta } = call.request;

    // Conectar à bancada via TCP
    const clienteBancada = net.createConnection({ host: ip, port: porta }, () => {
      console.log(`Conectado à bancada ${ip}:${porta}`);
    });

    clienteBancada.on("data", (bancadaData: Buffer) => {
      try {
        const bancada: BancadaData = JSON.parse(bancadaData.toString("utf-8"));
        temperaturaBancadas.push(Number(bancada.temperatura));
        umidadeBancadas.push(Number(bancada.umidade));
        condutividadeBancadas.push(Number(bancada.condutividade));

        const estatisticas = {
          mediaTemperatura: somarLista(temperaturaBancadas) / temperaturaBancadas.length,
          medianaTemperatura: calcularMediana(temperaturaBancadas),
          mediaUmidade: somarLista(umidadeBancadas) / umidadeBancadas.length,
          medianaUmidade: calcularMediana(umidadeBancadas),
          mediaCondutividade: somarLista(condutividadeBancadas) / condutividadeBancadas.length,
          medianaCondutividade: calcularMediana(condutividadeBancadas),
          temperaturas: temperaturaBancadas,
          umidades: umidadeBancadas,
          condutividades: condutividadeBancadas,
          bancadaId: bancada.id,
          erro: "",
        };

        callback(null, estatisticas);
      } catch (error) {
        console.error("Erro ao processar dados da bancada:", error);
        callback(null, { erro: "Erro ao processar dados" });
      } finally {
        clienteBancada.end();
      }
    });

    clienteBancada.on("error", (err) => {
      console.error("Erro na conexão com a bancada:", err);
      callback(null, { erro: "Erro na conexão com a bancada" });
    });
  },

  LimparTudo: (
    _: ServerUnaryCall<{}, any>,
    callback: sendUnaryData<{ mensagem: string }>
  ) => {
    limparTudo();
    callback(null, { mensagem: "Dados limpos com sucesso" });
  },
});

// Iniciar o servidor gRPC
grpcServer.bindAsync(
  "0.0.0.0:4000",
  ServerCredentials.createInsecure(),
  () => {
    console.log("Servidor gRPC escutando na porta 4000");
  }
);