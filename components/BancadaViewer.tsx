import React, { useState } from 'react';

export default function BancadaViewer() {
  const [ip, setIp] = useState('localhost');
  const [porta, setPorta] = useState('3001');
  const [resultado, setResultado] = useState<any | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buscarDados = async () => {
    setLoading(true);
    setErro(null);

    try {
      const response = await fetch(`/api/bancada?ip=${ip}&porta=${porta}`);
      const data = await response.json();
      if (data.erro) setErro(data.erro);
      else setResultado(data);
    } catch (err) {
      setErro('Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Estatísticas da Bancada</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="IP"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Porta"
          value={porta}
          onChange={(e) => setPorta(e.target.value)}
        />
      </div>

      <button
        onClick={buscarDados}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Buscando...' : 'Buscar'}
      </button>

      {erro && <p className="text-red-500 mt-4">{erro}</p>}

      {resultado && (
        <div className="mt-6 border rounded p-4 shadow bg-white">
          <h2 className="text-xl font-semibold mb-2">Bancada {resultado.bancadaId}</h2>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium">Temperatura (°C)</h3>
              <p>Média: {resultado.mediaTemperatura.toFixed(2)}</p>
              <p>Mediana: {resultado.medianaTemperatura.toFixed(2)}</p>
            </div>

            <div>
              <h3 className="font-medium">Umidade (%)</h3>
              <p>Média: {resultado.mediaUmidade.toFixed(2)}</p>
              <p>Mediana: {resultado.medianaUmidade.toFixed(2)}</p>
            </div>

            <div>
              <h3 className="font-medium">Condutividade</h3>
              <p>Média: {resultado.mediaCondutividade.toFixed(2)}</p>
              <p>Mediana: {resultado.medianaCondutividade.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Dados brutos</h3>
            <pre className="bg-gray-100 p-2 text-xs overflow-x-auto mt-2">
{JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}