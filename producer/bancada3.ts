import { producer } from '../kafka/config';
import { Bancada } from './bancada';

const executarBancada = async (id: number) => {
  await producer.connect();
  const bancada = new Bancada(id);

  setInterval(async () => {
    bancada.updateData();
    await bancada.publicarDados();
  }, 3000);
};

executarBancada(3);