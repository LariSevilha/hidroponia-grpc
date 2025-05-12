import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import * as readline from "readline-sync";

// Carregar definição proto
const protoDefs = loadSync("./bancada.proto");
const bancadaProto = loadPackageDefinition(protoDefs) as any;

// Criar cliente gRPC
const client = new bancadaProto.bancada.BancadaService(
  "localhost:4000",
  credentials.createInsecure()
);

// Interface para tipar a resposta de BuscarBancada
interface BancadaResponse {
  mediaTemperatura: number;
  medianaTemperatura: number;
  mediaUmidade: number;
  medianaUmidade: number;
  mediaCondutividade: number;
  medianaCondutividade: number;
  temperaturas: number[];
  umidades: number[];
  condutividades: number[];
  bancadaId: number;
  erro?: string;
}

async function buscarBancada(): Promise<void> {
  return new Promise((resolve) => {
    const ip: string = readline.question("Informe o ip: ");
    const porta: number = parseInt(readline.question("Informe a porta: "));

    client.BuscarBancada({ ip, porta }, (error: any, response: BancadaResponse) => {
      if (error) {
        console.error("Erro na chamada gRPC:", error);
        resolve();
        return;
      }

      if (response.erro) {
        console.log("Erro:", response.erro);
      } else {
        const {
          mediaTemperatura,
          medianaTemperatura,
          mediaUmidade,
          medianaUmidade,
          mediaCondutividade,
          medianaCondutividade,
          temperaturas,
          umidades,
          condutividades,
        } = response;

        console.log(`
Temperatura:
  • Média: ${parseFloat(mediaTemperatura.toString()).toFixed(2)}°C
  • Mediana: ${parseFloat(medianaTemperatura.toString()).toFixed(2)}°C
  • Valores: [${temperaturas.join(", ")}]
Umidade:
  • Média: ${parseFloat(mediaUmidade.toString()).toFixed(2)}%
  • Mediana: ${parseFloat(medianaUmidade.toString()).toFixed(2)}%
  • Valores: [${umidades.join(", ")}]
Condutividade:
  • Média: ${parseFloat(mediaCondutividade.toString()).toFixed(2)}
  • Mediana: ${parseFloat(medianaCondutividade.toString()).toFixed(2)}
  • Valores: [${condutividades.join(", ")}]
        `);
      }
      resolve();
    });
  });
}

async function limparTudo(): Promise<void> {
  return new Promise((resolve) => {
    client.LimparTudo({}, (error: any, response: { mensagem: string }) => {
      if (error) {
        console.error("Erro na chamada gRPC:", error);
      } else {
        console.log(response.mensagem);
      }
      resolve();
    });
  });
}

async function main() {
  let proseguir = true;

  while (proseguir) {
    console.log("\n=== MENU PRINCIPAL ===");
    console.log("1 - Buscar Bancada");
    console.log("2 - Limpar Tudo");
    console.log("0 - Sair");

    const opcao: number = readline.questionInt("Opção: ");

    switch (opcao) {
      case 1:
        await buscarBancada();
        break;
      case 2:
        await limparTudo();
        break;
      case 0:
        proseguir = false;
        console.log("Saindo...");
        break;
    }
  }
}

main();