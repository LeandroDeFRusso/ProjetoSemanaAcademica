import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('Critério 9b: PATCH alterando só título numa atividade cancelada retorna 422 ATIVIDADE_CANCELADA', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_canc',
        titulo: 'Atividade Cancelada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_c1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 1
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_canc`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': 'org-ana'
      },
      body: JSON.stringify({ titulo: 'Novo Título' })
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_CANCELADA');
  } finally {
    app.close();
  }
});

test('Critério 12: cancelar atividade já iniciada (não cancelada) retorna 422 ATIVIDADE_JA_INICIADA', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_ini',
        titulo: 'Atividade Iniciada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_i1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    // Relógio durante a atividade
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_ini/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_JA_INICIADA');
  } finally {
    app.close();
  }
});

test('Critério 12b: cancelar atividade já cancelada retorna 422 ATIVIDADE_CANCELADA', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_jacc',
        titulo: 'Já Cancelada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_jc1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T11:00:00-03:00' }
        ],
        cancelada: 1
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_jacc/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_CANCELADA');
  } finally {
    app.close();
  }
});

test('Critério 12c: cancelar atividade já iniciada E já cancelada retorna 422 ATIVIDADE_CANCELADA provando a ordem', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_inican',
        titulo: 'Iniciada e Cancelada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_ic1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 1
      })
    });

    // Relógio durante
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_inican/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_CANCELADA');
  } finally {
    app.close();
  }
});

test('Critério 16: situacao exatamente no instante do fim do último encontro é encerrada, não em_andamento', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_fim',
        titulo: 'Fim Exato',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_f1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    // Relógio exatamente no fim do último encontro
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T12:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_fim`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.situacao, 'encerrada');
  } finally {
    app.close();
  }
});
