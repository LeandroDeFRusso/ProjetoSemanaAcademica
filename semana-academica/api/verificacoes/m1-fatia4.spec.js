import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('POST /atividades/:id/cancelamento por participante retorna 403 SOMENTE_ORGANIZACAO', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_f4_1',
        titulo: 'Atividade Teste',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_f4_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_f4_1/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.erro, 'SOMENTE_ORGANIZACAO');
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/cancelamento com sucesso por organizador retorna 200 Atividade cancelada', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_f4_2',
        titulo: 'Atividade Para Cancelar',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_f4_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_f4_2/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.situacao, 'cancelada');
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/cancelamento em atividade que já iniciou retorna 422 ATIVIDADE_JA_INICIADA', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_f4_3',
        titulo: 'Atividade Já Iniciada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_f4_3', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_f4_3/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'ATIVIDADE_JA_INICIADA');
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/cancelamento em atividade já cancelada retorna 422 ATIVIDADE_CANCELADA', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_f4_4',
        titulo: 'Atividade Já Cancelada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_f4_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 1
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_f4_4/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'ATIVIDADE_CANCELADA');
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/cancelamento em atividade que já iniciou E já está cancelada retorna 422 ATIVIDADE_CANCELADA (prova a ordem)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_f4_5',
        titulo: 'Iniciada e Cancelada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_f4_5', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 1
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_f4_5/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'ATIVIDADE_CANCELADA');
  } finally {
    app.close();
  }
});
