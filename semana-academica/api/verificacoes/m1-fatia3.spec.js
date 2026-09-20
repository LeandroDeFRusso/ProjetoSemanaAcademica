import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('PATCH /atividades/:id por participante retorna 403 SOMENTE_ORGANIZACAO', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_p3_1',
        titulo: 'Atividade Original',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_p3_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_p3_1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'p-carla'
      },
      body: JSON.stringify({ titulo: 'Novo Título' })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.erro, 'SOMENTE_ORGANIZACAO');
  } finally {
    app.close();
  }
});

test('PATCH /atividades/:id alterando salaId, tipo ou encontros retorna 422 CAMPO_NAO_EDITAVEL', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_p3_2',
        titulo: 'Atividade Original',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_p3_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_p3_2`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({ salaId: 'sala-101' })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'CAMPO_NAO_EDITAVEL');
  } finally {
    app.close();
  }
});

test('PATCH /atividades/:id alterando titulo e vagas válidos retorna 200 Atividade', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_p3_3',
        titulo: 'Título Antigo',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_p3_3', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_p3_3`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({ titulo: 'Título Atualizado', vagas: 80 })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.titulo, 'Título Atualizado');
    assert.equal(body.vagas, 80);
  } finally {
    app.close();
  }
});

test('PATCH /atividades/:id definindo vagas <= 0 retorna 422 VAGAS_ACIMA_DA_CAPACIDADE', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_p3_4',
        titulo: 'Título Antigo',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_p3_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_p3_4`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({ vagas: 0 })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'VAGAS_ACIMA_DA_CAPACIDADE');
  } finally {
    app.close();
  }
});

test('PATCH /atividades/:id alterando tipo retorna 422 CAMPO_NAO_EDITAVEL', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_p3_tipo',
        titulo: 'Atividade Original',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_p3_t', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_p3_tipo`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({ tipo: 'minicurso' })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'CAMPO_NAO_EDITAVEL');
  } finally {
    app.close();
  }
});

test('PATCH /atividades/:id alterando encontros retorna 422 CAMPO_NAO_EDITAVEL', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_p3_enc',
        titulo: 'Atividade Original',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_p3_e', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_p3_enc`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({
        encontros: [
          { inicio: '2026-10-19T14:00:00-03:00', fim: '2026-10-19T15:00:00-03:00' }
        ]
      })
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.erro, 'CAMPO_NAO_EDITAVEL');
  } finally {
    app.close();
  }
});
