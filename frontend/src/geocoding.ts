export interface LocationGeoResult {
  lat: number;
  lng: number;
  label: string;
  bairro?: string;
  cidade: string;
  uf: string;
}

export interface BrazilianCapital {
  uf: string;
  cidade: string;
  regiao: 'Sudeste' | 'Sul' | 'Centro-Oeste' | 'Nordeste' | 'Norte';
  lat: number;
  lng: number;
  bairros: { nome: string; lat: number; lng: number }[];
}

export const BRAZILIAN_CAPITALS: BrazilianCapital[] = [
  // Região Sudeste
  {
    uf: 'RJ',
    cidade: 'Rio de Janeiro',
    regiao: 'Sudeste',
    lat: -22.9068,
    lng: -43.1729,
    bairros: [
      { nome: 'Taquara / Jacarepaguá', lat: -22.9231, lng: -43.3641 },
      { nome: 'Barra da Tijuca', lat: -22.9922, lng: -43.3644 },
      { nome: 'Madureira', lat: -22.8735, lng: -43.3392 },
      { nome: 'Tijuca', lat: -22.9338, lng: -43.2435 },
      { nome: 'Centro / Praça XV', lat: -22.9028, lng: -43.1729 },
      { nome: 'Botafogo', lat: -22.9535, lng: -43.1873 },
      { nome: 'Copacabana', lat: -22.9691, lng: -43.1864 },
    ],
  },
  {
    uf: 'SP',
    cidade: 'São Paulo',
    regiao: 'Sudeste',
    lat: -23.55052,
    lng: -46.633308,
    bairros: [
      { nome: 'Centro (Sé)', lat: -23.55052, lng: -46.633308 },
      { nome: 'Pinheiros', lat: -23.5678, lng: -46.6845 },
      { nome: 'Vila Mariana', lat: -23.5855, lng: -46.6391 },
      { nome: 'Mooca', lat: -23.5539, lng: -46.6022 },
      { nome: 'Santana', lat: -23.5042, lng: -46.6262 },
    ],
  },
  {
    uf: 'MG',
    cidade: 'Belo Horizonte',
    regiao: 'Sudeste',
    lat: -19.9208,
    lng: -43.9378,
    bairros: [
      { nome: 'Savassi / Centro', lat: -19.9328, lng: -43.9378 },
      { nome: 'Pampulha', lat: -19.8519, lng: -43.9712 },
    ],
  },
  {
    uf: 'ES',
    cidade: 'Vitória',
    regiao: 'Sudeste',
    lat: -20.3155,
    lng: -40.3128,
    bairros: [
      { nome: 'Ilha de Santa Maria / Centro', lat: -20.3155, lng: -40.3128 },
      { nome: 'Jardim da Penha', lat: -20.2882, lng: -40.2985 },
    ],
  },

  // Região Sul
  {
    uf: 'PR',
    cidade: 'Curitiba',
    regiao: 'Sul',
    lat: -25.4284,
    lng: -49.2733,
    bairros: [
      { nome: 'Batel / Central', lat: -25.4411, lng: -49.2789 },
      { nome: 'Portão', lat: -25.4735, lng: -49.2974 },
    ],
  },
  {
    uf: 'RS',
    cidade: 'Porto Alegre',
    regiao: 'Sul',
    lat: -30.0346,
    lng: -51.2177,
    bairros: [
      { nome: 'Menino Deus / Centro', lat: -30.0538, lng: -51.2225 },
      { nome: 'Moinhos de Vento', lat: -30.0277, lng: -51.2054 },
    ],
  },
  {
    uf: 'SC',
    cidade: 'Florianópolis',
    regiao: 'Sul',
    lat: -27.5954,
    lng: -48.548,
    bairros: [
      { nome: 'Itacorubi / Centro', lat: -27.5755, lng: -48.5115 },
      { nome: 'Trindade', lat: -27.5985, lng: -48.5202 },
    ],
  },

  // Região Centro-Oeste
  {
    uf: 'DF',
    cidade: 'Brasília',
    regiao: 'Centro-Oeste',
    lat: -15.7942,
    lng: -47.8822,
    bairros: [
      { nome: 'Asa Sul', lat: -15.7989, lng: -47.8828 },
      { nome: 'Asa Norte', lat: -15.7612, lng: -47.8814 },
      { nome: 'Taguatinga', lat: -15.8335, lng: -48.0566 },
    ],
  },
  {
    uf: 'GO',
    cidade: 'Goiânia',
    regiao: 'Centro-Oeste',
    lat: -16.6869,
    lng: -49.2648,
    bairros: [
      { nome: 'Setor Sul / Centro', lat: -16.6869, lng: -49.2648 },
      { nome: 'Setor Bueno', lat: -16.7028, lng: -49.2735 },
    ],
  },
  {
    uf: 'MT',
    cidade: 'Cuiabá',
    regiao: 'Centro-Oeste',
    lat: -15.6014,
    lng: -56.0979,
    bairros: [
      { nome: 'Bosque da Saúde / Centro', lat: -15.6014, lng: -56.0979 },
      { nome: 'Alvorada', lat: -15.5872, lng: -56.0825 },
    ],
  },
  {
    uf: 'MS',
    cidade: 'Campo Grande',
    regiao: 'Centro-Oeste',
    lat: -20.4697,
    lng: -54.6201,
    bairros: [
      { nome: 'Amambaí / Centro', lat: -20.4697, lng: -54.6201 },
      { nome: 'Chácara Cachoeira', lat: -20.4552, lng: -54.5828 },
    ],
  },

  // Região Nordeste
  {
    uf: 'BA',
    cidade: 'Salvador',
    regiao: 'Nordeste',
    lat: -12.9714,
    lng: -38.5014,
    bairros: [
      { nome: 'Barra / Centro', lat: -13.0038, lng: -38.5284 },
      { nome: 'Pituba', lat: -12.9984, lng: -38.4591 },
    ],
  },
  {
    uf: 'CE',
    cidade: 'Fortaleza',
    regiao: 'Nordeste',
    lat: -3.7319,
    lng: -38.5267,
    bairros: [
      { nome: 'Aldeota / Centro', lat: -3.7319, lng: -38.5267 },
      { nome: 'Meireles', lat: -3.7258, lng: -38.4982 },
    ],
  },
  {
    uf: 'PE',
    cidade: 'Recife',
    regiao: 'Nordeste',
    lat: -8.0476,
    lng: -34.877,
    bairros: [
      { nome: 'Boa Viagem', lat: -8.1189, lng: -34.9036 },
      { nome: 'Recife Antigo / Centro', lat: -8.0632, lng: -34.8711 },
    ],
  },
  {
    uf: 'RN',
    cidade: 'Natal',
    regiao: 'Nordeste',
    lat: -5.7945,
    lng: -35.211,
    bairros: [
      { nome: 'Capim Macio', lat: -5.8562, lng: -35.2078 },
      { nome: 'Tirol / Central', lat: -5.7995, lng: -35.2014 },
    ],
  },
  {
    uf: 'MA',
    cidade: 'São Luís',
    regiao: 'Nordeste',
    lat: -2.5307,
    lng: -44.3068,
    bairros: [
      { nome: 'Renascença / Centro', lat: -2.5307, lng: -44.3068 },
      { nome: 'Calhau', lat: -2.4985, lng: -44.2755 },
    ],
  },
  {
    uf: 'PB',
    cidade: 'João Pessoa',
    regiao: 'Nordeste',
    lat: -7.1195,
    lng: -34.845,
    bairros: [
      { nome: 'Tambaú / Centro', lat: -7.1195, lng: -34.845 },
      { nome: 'Manaíra', lat: -7.0985, lng: -34.8352 },
    ],
  },
  {
    uf: 'AL',
    cidade: 'Maceió',
    regiao: 'Nordeste',
    lat: -9.6658,
    lng: -35.7351,
    bairros: [
      { nome: 'Pajuçara / Centro', lat: -9.6658, lng: -35.7351 },
      { nome: 'Ponta Verde', lat: -9.6582, lng: -35.7025 },
    ],
  },
  {
    uf: 'PI',
    cidade: 'Teresina',
    regiao: 'Nordeste',
    lat: -5.092,
    lng: -42.8038,
    bairros: [
      { nome: 'Jóquei / Centro', lat: -5.092, lng: -42.8038 },
      { nome: 'Fátima', lat: -5.0785, lng: -42.7952 },
    ],
  },
  {
    uf: 'SE',
    cidade: 'Aracaju',
    regiao: 'Nordeste',
    lat: -10.9472,
    lng: -37.0731,
    bairros: [
      { nome: 'Atalaia / Centro', lat: -10.9472, lng: -37.0731 },
      { nome: '13 de Julho', lat: -10.9352, lng: -37.0552 },
    ],
  },

  // Região Norte
  {
    uf: 'AM',
    cidade: 'Manaus',
    regiao: 'Norte',
    lat: -3.119,
    lng: -60.0217,
    bairros: [
      { nome: 'Adrianópolis / Centro', lat: -3.119, lng: -60.0217 },
      { nome: 'Ponta Negra', lat: -3.0768, lng: -60.0894 },
    ],
  },
  {
    uf: 'PA',
    cidade: 'Belém',
    regiao: 'Norte',
    lat: -1.4558,
    lng: -48.4902,
    bairros: [
      { nome: 'Nazaré / Centro', lat: -1.4558, lng: -48.4902 },
      { nome: 'Umarizal', lat: -1.4425, lng: -48.4852 },
    ],
  },
  {
    uf: 'RO',
    cidade: 'Porto Velho',
    regiao: 'Norte',
    lat: -8.7619,
    lng: -63.9039,
    bairros: [
      { nome: 'Olaria / Centro', lat: -8.7619, lng: -63.9039 },
      { nome: 'Nova Porto Velho', lat: -8.7752, lng: -63.8852 },
    ],
  },
  {
    uf: 'TO',
    cidade: 'Palmas',
    regiao: 'Norte',
    lat: -10.2491,
    lng: -48.3243,
    bairros: [
      { nome: 'Plano Diretor Sul / Centro', lat: -10.2491, lng: -48.3243 },
      { nome: 'Graciosa', lat: -10.2185, lng: -48.3452 },
    ],
  },
  {
    uf: 'AC',
    cidade: 'Rio Branco',
    regiao: 'Norte',
    lat: -9.9753,
    lng: -67.8249,
    bairros: [
      { nome: 'Bosque / Centro', lat: -9.9753, lng: -67.8249 },
      { nome: 'Estação Experimental', lat: -9.9652, lng: -67.8125 },
    ],
  },
  {
    uf: 'AP',
    cidade: 'Macapá',
    regiao: 'Norte',
    lat: 0.0355,
    lng: -51.0705,
    bairros: [
      { nome: 'Central / Trem', lat: 0.0355, lng: -51.0705 },
      { nome: 'Santa Rita', lat: 0.0425, lng: -51.0625 },
    ],
  },
  {
    uf: 'RR',
    cidade: 'Boa Vista',
    regiao: 'Norte',
    lat: 2.8235,
    lng: -60.6758,
    bairros: [
      { nome: 'São Francisco / Centro', lat: 2.8235, lng: -60.6758 },
      { nome: 'Paraviana', lat: 2.8352, lng: -60.6652 },
    ],
  },
];

const UF_CAPITAL_FALLBACK: Record<string, { lat: number; lng: number; cidade: string }> = Object.fromEntries(
  BRAZILIAN_CAPITALS.map((c) => [c.uf, { lat: c.lat, lng: c.lng, cidade: c.cidade }])
);

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
    // Fallback inteligente por prefixo postal brasileiro
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

  // 2. Busca de bairro na base de capitais
  const capitalMatch = BRAZILIAN_CAPITALS.find(
    (c) => c.uf === uf && c.cidade.toLowerCase() === cidade.toLowerCase()
  );

  if (capitalMatch && bairro) {
    const bMatch = capitalMatch.bairros.find(
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

  // 3. Fallback para as coordenadas da capital
  if (capitalMatch) {
    return {
      lat: capitalMatch.lat,
      lng: capitalMatch.lng,
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

  return {
    lat: -15.7942,
    lng: -47.8822,
    label: `${cidade} - ${uf}`,
    bairro,
    cidade,
    uf,
  };
}
