import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('GET /encontros/:id/codigo dentro da janela valida retorna 200 com CodigoDoEncontro (R1)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade com encontro em 2026-10-19T10:00:00-03:00
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_1',
        titulo: 'Palestra QR',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Janela começa 15 min antes (09:45) até 30 min depois (10:30)
    // Definir relógio para 10:00 (dentro da janela)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_1/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.encontroId, 'enc_m3_1');
    assert.ok(data.codigo);
    assert.equal(typeof data.codigo, 'string');
    assert.equal(data.codigo.length, 6);
    assert.ok(data.trocaEm);
    assert.ok(data.validoAte);
  } finally {
    app.close();
  }
});

test('GET /encontros/:id/codigo fora da janela de registro (mais de 15 min antes) retorna 422 FORA_DA_JANELA (R1)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_2',
        titulo: 'Palestra QR 2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Relógio às 09:44 (16 minutos antes, fora da janela que começa às 09:45)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:44:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_2/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'FORA_DA_JANELA');
  } finally {
    app.close();
  }
});

test('GET /encontros/:id/codigo fora da janela de registro (mais de 30 min depois) retorna 422 FORA_DA_JANELA (R1)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_3',
        titulo: 'Palestra QR 3',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_3', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Relógio às 10:31 (31 minutos depois, fora da janela que termina às 10:30)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:31:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_3/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'FORA_DA_JANELA');
  } finally {
    app.close();
  }
});

test('GET /encontros/:id/codigo com atividade cancelada retorna 422 ATIVIDADE_CANCELADA (R1)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_4',
        titulo: 'Palestra QR Cancelada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 1
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_4/codigo`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_CANCELADA');
  } finally {
    app.close();
  }
});

test('GET /encontros/:id/codigo por participante retorna 403 SOMENTE_ORGANIZACAO (R7)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_5',
        titulo: 'Palestra QR 5',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_5', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_5/codigo`, {
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'SOMENTE_ORGANIZACAO');
  } finally {
    app.close();
  }
});
