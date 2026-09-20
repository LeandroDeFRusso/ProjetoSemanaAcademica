import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('POST /atividades por participante retorna 403 SOMENTE_ORGANIZACAO', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'p-carla'
      },
      body: JSON.stringify({
        titulo: 'Palestra de Abertura',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.erro, 'SOMENTE_ORGANIZACAO');
  } finally {
    app.close();
  }
});

test('POST /atividades com minicurso contendo 1 encontro retorna 422 QUANTIDADE_DE_ENCONTROS', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Minicurso Curto',
        tipo: 'minicurso',
        salaId: 'sala-101',
        vagas: 30,
        encontros: [
          { inicio: '2026-10-19T14:00:00-03:00', fim: '2026-10-19T16:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'QUANTIDADE_DE_ENCONTROS');
  } finally {
    app.close();
  }
});

test('POST /atividades com palestra contendo 2 encontros retorna 422 QUANTIDADE_DE_ENCONTROS', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Palestra Longa',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' },
          { inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T13:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'QUANTIDADE_DE_ENCONTROS');
  } finally {
    app.close();
  }
});

test('POST /atividades com encontro de 30 minutos retorna 422 ENCONTRO_INVALIDO', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Palestra Curta',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T10:30:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'ENCONTRO_INVALIDO');
  } finally {
    app.close();
  }
});

test('POST /atividades com encontro fora do período do evento retorna 422 ENCONTRO_INVALIDO', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Palestra Fora do Prazo',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { inicio: '2026-10-18T10:00:00-03:00', fim: '2026-10-18T12:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'ENCONTRO_INVALIDO');
  } finally {
    app.close();
  }
});

test('POST /atividades com vagas acima da capacidade da sala retorna 422 VAGAS_ACIMA_DA_CAPACIDADE', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Palestra Super Lotação',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 250,
        encontros: [
          { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'VAGAS_ACIMA_DA_CAPACIDADE');
  } finally {
    app.close();
  }
});

test('POST /atividades com conflito de sala (menos de 15 min de intervalo) retorna 409 CONFLITO_DE_SALA', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_1',
        titulo: 'Palestra 1',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { id: 'enc_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Palestra 2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { inicio: '2026-10-19T12:10:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.erro, 'CONFLITO_DE_SALA');
  } finally {
    app.close();
  }
});

test('POST /atividades com sucesso calcula cargaHorariaMinutos corretamente e ignora valor enviado (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        titulo: 'Palestra de Sucesso',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        cargaHorariaMinutos: 9999,
        encontros: [
          { inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.equal(body.titulo, 'Palestra de Sucesso');
    assert.equal(body.cargaHorariaMinutos, 120);
  } finally {
    app.close();
  }
});
