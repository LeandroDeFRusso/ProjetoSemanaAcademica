import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('POST /encontros/:id/presencas por usuario da organizacao retorna 403 SOMENTE_PARTICIPANTE (R7)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f2_1',
        titulo: 'Palestra Presenca',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f2_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_1/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ codigo: 'ABCDEF' })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'SOMENTE_PARTICIPANTE');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas por participante sem inscricao confirmada retorna 403 NAO_INSCRITO (R4)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f2_2',
        titulo: 'Palestra Presenca 2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f2_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    // p-carla tenta registrar presença sem estar inscrita
    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_2/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ codigo: 'ABCDEF' })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'NAO_INSCRITO');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas com codigo valido retorna 201 na primeira vez e 200 nas subsequentes (R2)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f2_3',
        titulo: 'Palestra Presenca 3',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f2_3', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    // Inscrever p-carla
    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_m3_f2_3/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);

    // Relógio às 10:00 (dentro da janela)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    // Obter código válido via org-ana
    const codRes = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_3/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(codRes.status, 200);
    const codData = await codRes.json();
    const codigo = codData.codigo;

    // Registrar presença primeira vez (201)
    const presRes1 = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_3/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ codigo })
    });
    assert.equal(presRes1.status, 201);
    const pres1 = await presRes1.json();
    assert.ok(pres1.id);
    assert.equal(pres1.encontroId, 'enc_m3_f2_3');
    assert.equal(pres1.participanteId, 'p-carla');
    assert.equal(pres1.origem, 'qr');
    assert.ok(pres1.registradaEm);

    // Registrar presença segunda vez (200 - duplicada)
    const presRes2 = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_3/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ codigo })
    });
    assert.equal(presRes2.status, 200);
    const pres2 = await presRes2.json();
    assert.equal(pres2.id, pres1.id);
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas com codigo invalido retorna 422 CODIGO_INVALIDO (R2)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f2_4',
        titulo: 'Palestra Presenca 4',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f2_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    await fetch(`http://localhost:${porta}/atividades/atv_m3_f2_4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_4/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ codigo: 'INVALID' })
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'CODIGO_INVALIDO');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas com lidoEm (offline) validando janela e codigo e aceitando tolerancia do minuto anterior (R2)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f2_5',
        titulo: 'Palestra Presenca 5',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f2_5', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    await fetch(`http://localhost:${porta}/atividades/atv_m3_f2_5/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    // Relógio em 10:00 para pegar código do minuto 10:00
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    const codRes = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_5/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    const codData = await codRes.json();
    const codigo1000 = codData.codigo;

    // Avançar relógio para 10:01 (lidoEm anterior ou atual)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:01:00-03:00' })
    });

    // Envia presença offline com lidoEm = 10:00 e código de 10:00 (minuto anterior em relação a 10:01)
    const presRes = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_5/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ codigo: codigo1000, lidoEm: '2026-10-19T10:00:30-03:00' })
    });
    assert.equal(presRes.status, 201);
    const pres = await presRes.json();
    assert.equal(pres.origem, 'qr_offline');
    assert.ok(pres.lidoEm);
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas com lidoEm enviado mais de 2 horas apos o fim do encontro retorna 422 SINCRONIZACAO_TARDIA (R3)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f2_6',
        titulo: 'Palestra Presenca 6',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f2_6', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    await fetch(`http://localhost:${porta}/atividades/atv_m3_f2_6/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    const codRes = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_6/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    const codData = await codRes.json();

    // Relógio avança para 14:01 (fim foi 12:00, mais de 2 horas depois)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T14:01:00-03:00' })
    });

    const presRes = await fetch(`http://localhost:${porta}/encontros/enc_m3_f2_6/presencas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ codigo: codData.codigo, lidoEm: '2026-10-19T10:00:00-03:00' })
    });
    assert.equal(presRes.status, 422);
    const data = await presRes.json();
    assert.equal(data.erro, 'SINCRONIZACAO_TARDIA');
  } finally {
    app.close();
  }
});
