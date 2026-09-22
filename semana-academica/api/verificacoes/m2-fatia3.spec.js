import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('participante tenta cancelar inscricao apos o inicio da atividade retorna 422 ATIVIDADE_JA_INICIADA (R8)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f3_1',
        titulo: 'Palestra Teste',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Relógio antes do início
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    // Inscrição
    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_f3_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);
    const inscricao = await insRes.json();

    // Avançar relógio para após o início da atividade (10:00)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T10:01:00-03:00' })
    });

    // Tentar cancelar
    const res = await fetch(`http://localhost:${porta}/inscricoes/${inscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_JA_INICIADA');
  } finally {
    app.close();
  }
});

test('participante tenta cancelar inscricao ja cancelada retorna 422 INSCRICAO_INATIVA (R8)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f3_2',
        titulo: 'Palestra Teste 2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_f3_2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);
    const inscricao = await insRes.json();

    // Primeiro cancelamento (sucesso)
    const res1 = await fetch(`http://localhost:${porta}/inscricoes/${inscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res1.status, 200);

    // Segundo cancelamento (inscrição inativa)
    const res2 = await fetch(`http://localhost:${porta}/inscricoes/${inscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res2.status, 422);
    const data = await res2.json();
    assert.equal(data.erro, 'INSCRICAO_INATIVA');
  } finally {
    app.close();
  }
});

test('participante tenta cancelar inscricao de outro participante retorna 404 NAO_ENCONTRADO (R2, Criterio 5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f3_3',
        titulo: 'Palestra Teste 3',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_3', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_f3_3/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);
    const inscricao = await insRes.json();

    // Diego tenta cancelar inscrição de Carla
    const res = await fetch(`http://localhost:${porta}/inscricoes/${inscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(res.status, 404);
  } finally {
    app.close();
  }
});

test('usuario da organizacao tenta cancelar inscricao retorna 403 SOMENTE_PARTICIPANTE (R9)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f3_4',
        titulo: 'Palestra Teste 4',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_f3_4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);
    const inscricao = await insRes.json();

    // Ana (organizacao) tenta cancelar inscrição
    const res = await fetch(`http://localhost:${porta}/inscricoes/${inscricao.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'SOMENTE_PARTICIPANTE');
  } finally {
    app.close();
  }
});
