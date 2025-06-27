import { loadSync } from '@grpc/proto-loader';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import * as readline from 'readline-sync';

const protoDefs = loadSync('./bancada.proto');
const bancadaProto = loadPackageDefinition(protoDefs) as any;
const client = new bancadaProto.bancada.BancadaService('localhost:4000', credentials.createInsecure());

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
    const ip = readline.question('Informe o IP: ');
    const porta = readline.questionInt('Informe a porta: ');

    client.BuscarBancada({ ip, porta }, (error: any, response: BancadaResponse) => {
      if (error) {
        console.error('Erro:', error);
        resolve(); return;
      }

      if (response.erro) {
        console.log('Erro:', response.erro);
      } else {
        console.log(`\nTemperatura Média: ${response.mediaTemperatura.toFixed(2)}°C`);
        console.log(`Temperatura Mediana: ${response.medianaTemperatura.toFixed(2)}°C`);
        console.log(`Umidade Média: ${response.mediaUmidade.toFixed(2)}%`);
        console.log(`Umidade Mediana: ${response.medianaUmidade.toFixed(2)}%`);
        console.log(`Condutividade Média: ${response.mediaCondutividade.toFixed(2)}`);
        console.log(`Condutividade Mediana: ${response.medianaCondutividade.toFixed(2)}`);
      }
      resolve();
    });
  });
}

async function limparTudo(): Promise<void> {
  return new Promise((resolve) => {
    client.LimparTudo({}, (error: any, response: { mensagem: string }) => {
      if (error) console.error('Erro:', error);
      else console.log(response.mensagem);
      resolve();
    });
  });
}

async function main() {
  let continuar = true;
  while (continuar) {
    console.log('\n1 - Buscar Bancada');
    console.log('2 - Limpar Tudo');
    console.log('0 - Sair');
    const opcao = readline.questionInt('Opção: ');

    if (opcao === 1) await buscarBancada();
    else if (opcao === 2) await limparTudo();
    else continuar = false;
  }
}

main();