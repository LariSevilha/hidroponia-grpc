import * as net from "net";

export interface BancadaInterface {
  id?: number;
  temperatura: number;
  umidade: number;
  condutividade: number;
}

class Bancada implements BancadaInterface {
  id: number;
  temperatura: number;
  umidade: number;
  condutividade: number;

  constructor(id: number) {
    this.id = id;
    this.temperatura = parseFloat((Math.random() * (26 - 18) + 18).toFixed(2));
    this.umidade = parseFloat((Math.random() * (90 - 60) + 60).toFixed(2));
    this.condutividade = parseFloat(
      (Math.random() * (2.5 - 1.2) + 1.2).toFixed(2)
    );
  }
}

const servidor = net.createServer((socket) => {
  console.log("Cliente conectado");
  socket.write(JSON.stringify(new Bancada(3)));
  socket.on("close", () => {
    console.log("Cliente desconectado");
  });
});

servidor.listen(3002, () => {
  console.log("Servidor escutando na porta 3002");
});
