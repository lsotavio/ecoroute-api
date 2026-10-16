export interface LocationGeoResult {
  lat: number;
  lng: number;
  label: string;
  bairro?: string;
  cidade: string;
  uf: string;
}

export interface CityOption {
  uf: string;
  cidade: string;
  bairros: { nome: string; lat: number; lng: number }[];
}

export const POPULAR_LOCATIONS: CityOption[] = [
  {
    uf: 'RJ',
    cidade: 'Rio de Janeiro',
    bairros: [
      { nome: 'Taquara / Jacarepaguá', lat: -22.9231, lng: -43.3641 },
      { nome: 'Madureira / Cascadura', lat: -22.8735, lng: -43.3392 },
      { nome: 'Barra da Tijuca', lat: -22.9922, lng: -43.3644 },
      { nome: 'Centro / Praça XV', lat: -22.9028, lng: -43.1729 },
      { nome: 'Copacabana', lat: -22.9691, lng: -43.1864 },
      { nome: 'Botafogo', lat: -22.9535, lng: -43.1873 },
      { nome: 'Tijuca', lat: -22.9338, lng: -43.2435 },
      { nome: 'Campo Grande', lat: -22.9038, lng: -43.5591 },
      { nome: 'Bangu', lat: -22.8805, lng: -43.4658 },
    ],
  },
  {
    uf: 'RN',
    cidade: 'Parnamirim',
    bairros: [
      { nome: 'Centro', lat: -5.9156, lng: -35.2628 },
      { nome: 'Cohabinal', lat: -5.9221, lng: -35.2715 },
      { nome: 'Nova Parnamirim', lat: -5.8892, lng: -35.2154 },
      { nome: 'Emaús', lat: -5.9015, lng: -35.2431 },
    ],
  },
  {
    uf: 'RN',
    cidade: 'Natal',
    bairros: [
      { nome: 'Capim Macio', lat: -5.8562, lng: -35.2078 },
      { nome: 'Tirol', lat: -5.7995, lng: -35.2014 },
      { nome: 'Ponta Negra', lat: -5.8824, lng: -35.1764 },
      { nome: 'Petrópolis / Centro', lat: -5.7891, lng: -35.2045 },
    ],
  },
  {
    uf: 'SP',
    cidade: 'São Paulo',
    bairros: [
      { nome: 'Centro (Sé)', lat: -23.55052, lng: -46.633308 },
      { nome: 'Pinheiros', lat: -23.5678, lng: -46.6845 },
      { nome: 'Vila Mariana', lat: -23.5855, lng: -46.6391 },
      { nome: 'Mooca', lat: -23.5539, lng: -46.6022 },
      { nome: 'Santana', lat: -23.5042, lng: -46.6262 },
      { nome: 'Itaquera', lat: -23.5325, lng: -46.4533 },
      { nome: 'Santo Amaro', lat: -23.6528, lng: -46.7089 },
    ],
  },
  {
    uf: 'MG',
    cidade: 'Belo Horizonte',
    bairros: [
      { nome: 'Savassi / Centro', lat: -19.9328, lng: -43.9378 },
      { nome: 'Pampulha', lat: -19.8519, lng: -43.9712 },
    ],
  },
  {
    uf: 'PR',
    cidade: 'Curitiba',
    bairros: [
      { nome: 'Batel / Central', lat: -25.4411, lng: -49.2789 },
      { nome: 'Portão', lat: -25.4735, lng: -49.2974 },
    ],
  },
  {
    uf: 'DF',
    cidade: 'Brasília',
    bairros: [
      { nome: 'Asa Sul', lat: -15.7989, lng: -47.8828 },
      { nome: 'Asa Norte', lat: -15.7612, lng: -47.8814 },
      { nome: 'Taguatinga', lat: -15.8335, lng: -48.0566 },
    ],
  },
  {
    uf: 'BA',
    cidade: 'Salvador',
    bairros: [
      { nome: 'Barra', lat: -13.0038, lng: -38.5284 },
      { nome: 'Pituba', lat: -12.9984, lng: -38.4591 },
      { nome: 'Pelourinho / Centro', lat: -12.9714, lng: -38.5114 },
    ],
  },
  {
    uf: 'PE',
    cidade: 'Recife',
    bairros: [
      { nome: 'Boa Viagem', lat: -8.1189, lng: -34.9036 },
      { nome: 'Casa Forte / Graças', lat: -8.0335, lng: -34.9128 },
      { nome: 'Recife Antigo', lat: -8.0632, lng: -34.8711 },
    ],
  },
  {
    uf: 'RS',
    cidade: 'Porto Alegre',
    bairros: [
      { nome: 'Moinhos de Vento / Centro', lat: -30.0277, lng: -51.2287 },
      { nome: 'Menino Deus', lat: -30.0538, lng: -51.2225 },
    ],
  },
  {
    uf: 'AM',
    cidade: 'Manaus',
    bairros: [
      { nome: 'Adrianópolis / Centro', lat: -3.1190, lng: -60.0217 },
      { nome: 'Ponta Negra', lat: -3.0768, lng: -60.0894 },
    ],
  },
];

const UF_CAPITAL_FALLBACK: Record<string, { lat: number; lng: number; cidade: string }> = {
  AC: { lat: -9.9753, lng: -67.8249, cidade: 'Rio Branco' },
  AL: { lat: -9.6658, lng: -35.7351, cidade: 'Maceió' },
  AP: { lat: 0.0355, lng: -51.0705, cidade: 'Macapá' },
  AM: { lat: -3.119, lng: -60.0217, cidade: 'Manaus' },
  BA: { lat: -12.9714, lng: -38.5014, cidade: 'Salvador' },
  CE: { lat: -3.7319, lng: -38.5267, cidade: 'Fortaleza' },
  DF: { lat: -15.7942, lng: -47.8822, cidade: 'Brasília' },
  ES: { lat: -20.3155, lng: -40.3128, cidade: 'Vitória' },
  GO: { lat: -16.6869, lng: -49.2648, cidade: 'Goiânia' },
  MA: { lat: -2.5307, lng: -44.3068, cidade: 'São Luís' },
  MT: { lat: -15.6014, lng: -56.0979, cidade: 'Cuiabá' },
  MS: { lat: -20.4697, lng: -54.6201, cidade: 'Campo Grande' },
  MG: { lat: -19.9208, lng: -43.9378, cidade: 'Belo Horizonte' },
  PA: { lat: -1.4558, lng: -48.4902, cidade: 'Belém' },
  PB: { lat: -7.1195, lng: -34.845, cidade: 'João Pessoa' },
  PR: { lat: -25.4284, lng: -49.2733, cidade: 'Curitiba' },
  PE: { lat: -8.0476, lng: -34.877, cidade: 'Recife' },
  PI: { lat: -5.092, lng: -42.8038, cidade: 'Teresina' },
  RJ: { lat: -22.9068, lng: -43.1729, cidade: 'Rio de Janeiro' },
  RN: { lat: -5.7945, lng: -35.211, cidade: 'Natal' },
  RS: { lat: -30.0346, lng: -51.2177, cidade: 'Porto Alegre' },
  RO: { lat: -8.7619, lng: -63.9039, cidade: 'Porto Velho' },
  RR: { lat: 2.8235, lng: -60.6758, cidade: 'Boa Vista' },
  SC: { lat: -27.5954, lng: -48.548, cidade: 'Florianópolis' },
  SP: { lat: -23.5505, lng: -46.6333, cidade: 'São Paulo' },
  SE: { lat: -10.9472, lng: -37.0731, cidade: 'Aracaju' },
  TO: { lat: -10.2491, lng: -48.3243, cidade: 'Palmas' },
};

export async function lookupCepLocation(rawCep: string): Promise<LocationGeoResult> {
  const cleanCep = rawCep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    throw new Error('Informe um CEP válido contendo exatamente 8 dígitos (ex: 22775-055).');
  }

  let viacepData: {
    cep: string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    erro?: boolean;
  };

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!res.ok) {
      throw new Error(`Serviço ViaCEP indisponível (HTTP ${res.status}).`);
    }
    viacepData = await res.json();
  } catch (netErr) {
    throw new Error('Falha de conexão ao consultar o CEP no ViaCEP.');
  }

  if (viacepData.erro || !viacepData.localidade || !viacepData.uf) {
    // Fallback inteligente por faixa de prefixo de CEP brasileiro caso o CEP específico não esteja na base
    const prefix2 = parseInt(cleanCep.slice(0, 2), 10);
    let guessedUf = '';
    if (prefix2 >= 1 && prefix2 <= 19) guessedUf = 'SP';
    else if (prefix2 >= 20 && prefix2 <= 28) guessedUf = 'RJ';
    else if (prefix2 === 29) guessedUf = 'ES';
    else if (prefix2 >= 30 && prefix2 <= 39) guessedUf = 'MG';
    else if (prefix2 >= 40 && prefix2 <= 48) guessedUf = 'BA';
    else if (prefix2 === 49) guessedUf = 'SE';
    else if (prefix2 >= 50 && prefix2 <= 56) guessedUf = 'PE';
    else if (prefix2 === 57) guessedUf = 'AL';
    else if (prefix2 === 58) guessedUf = 'PB';
    else if (prefix2 === 59) guessedUf = 'RN';
    else if (prefix2 >= 60 && prefix2 <= 63) guessedUf = 'CE';
    else if (prefix2 === 64) guessedUf = 'PI';
    else if (prefix2 === 65) guessedUf = 'MA';
    else if (prefix2 >= 66 && prefix2 <= 68) guessedUf = 'PA';
    else if (prefix2 === 69) guessedUf = 'AM';
    else if (prefix2 >= 70 && prefix2 <= 72) guessedUf = 'DF';
    else if (prefix2 >= 73 && prefix2 <= 76) guessedUf = 'GO';
    else if (prefix2 === 77) guessedUf = 'TO';
    else if (prefix2 === 78) guessedUf = 'MT';
    else if (prefix2 === 79) guessedUf = 'MS';
    else if (prefix2 >= 80 && prefix2 <= 87) guessedUf = 'PR';
    else if (prefix2 >= 88 && prefix2 <= 89) guessedUf = 'SC';
    else if (prefix2 >= 90 && prefix2 <= 99) guessedUf = 'RS';

    if (guessedUf && UF_CAPITAL_FALLBACK[guessedUf]) {
      const fb = UF_CAPITAL_FALLBACK[guessedUf];
      return {
        lat: fb.lat,
        lng: fb.lng,
        label: `${fb.cidade} - ${guessedUf} (Região aproximada do CEP ${cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2')})`,
        cidade: fb.cidade,
        uf: guessedUf,
      };
    }

    throw new Error(`CEP ${cleanCep} não localizado nos Correios. Verifique o número digitado.`);
  }

  const cidade = viacepData.localidade;
  const uf = viacepData.uf.toUpperCase();
  const bairro = viacepData.bairro || '';
  const logradouro = viacepData.logradouro || '';

  // 1. Tenta geocodificar com alta precisão via OpenStreetMap Nominatim
  try {
    const queryParts = [logradouro, bairro, cidade, uf, 'Brasil'].filter((p) => p.length > 0);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&country=Brazil&state=${encodeURIComponent(
      uf
    )}&city=${encodeURIComponent(cidade)}&q=${encodeURIComponent(queryParts.join(', '))}&limit=1`;

    const geoRes = await fetch(nominatimUrl, {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    if (geoRes.ok) {
      const geoList = await geoRes.json();
      if (Array.isArray(geoList) && geoList.length > 0 && geoList[0].lat && geoList[0].lon) {
        return {
          lat: Number(Number(geoList[0].lat).toFixed(6)),
          lng: Number(Number(geoList[0].lon).toFixed(6)),
          label: `${bairro ? bairro + ', ' : ''}${cidade} - ${uf} (CEP ${cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2')})`,
          bairro,
          cidade,
          uf,
        };
      }
    }
  } catch {
    // Continua para o resolvedor local em caso de falha de rede do Nominatim
  }

  // 2. Busca de bairro na base regional pré-carregada
  const cityMatch = POPULAR_LOCATIONS.find(
    (c) => c.uf === uf && c.cidade.toLowerCase() === cidade.toLowerCase()
  );

  if (cityMatch && bairro) {
    const bMatch = cityMatch.bairros.find(
      (b) =>
        b.nome.toLowerCase().includes(bairro.toLowerCase()) ||
        bairro.toLowerCase().includes(b.nome.toLowerCase())
    );
    if (bMatch) {
      return {
        lat: bMatch.lat,
        lng: bMatch.lng,
        label: `${bairro}, ${cidade} - ${uf}`,
        bairro,
        cidade,
        uf,
      };
    }
  }

  // 3. Fallback para as coordenadas da capital ou primeiro bairro da cidade
  if (cityMatch && cityMatch.bairros.length > 0) {
    const primary = cityMatch.bairros[0];
    return {
      lat: primary.lat,
      lng: primary.lng,
      label: `${bairro ? bairro + ', ' : ''}${cidade} - ${uf}`,
      bairro,
      cidade,
      uf,
    };
  }

  const ufFallback = UF_CAPITAL_FALLBACK[uf];
  if (ufFallback) {
    return {
      lat: ufFallback.lat,
      lng: ufFallback.lng,
      label: `${cidade} - ${uf}`,
      bairro,
      cidade,
      uf,
    };
  }

  // Coordenada central do Brasil caso estado não conste
  return {
    lat: -15.7942,
    lng: -47.8822,
    label: `${cidade} - ${uf}`,
    bairro,
    cidade,
    uf,
  };
}
