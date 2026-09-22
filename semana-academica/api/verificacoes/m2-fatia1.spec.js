import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('participante realiza inscricao direta com vaga disponivel (R3)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade com vagas
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_1',
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

    // Relógio antes do encerramento
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    // Participante realiza inscrição
    const res = await fetch(`http://localhost:${porta}/atividades/atv_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res.status, 201);
    const inscricao = await res.json();
    assert.ok(inscricao.id);
    assert.equal(inscricao.atividadeId, 'atv_1');
    assert.equal(inscricao.participanteId, 'p-carla');
    assert.equal(inscricao.status, 'confirmada');
    assert.equal(inscricao.posicaoNaEspera, null);
    assert.ok(inscricao.criadaEm);
  } finally {
    app.close();
  }
});

test('participante realiza inscricao em espera quando atividade esta lotada (R3)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade com 1 vaga
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_lotada',
        titulo: 'Palestra Lotada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 1,
        encontros: [
          { id: 'enc_lot', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    // Primeira inscrição (ocupa a única vaga)
    const res1 = await fetch(`http://localhost:${porta}/atividades/atv_lotada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res1.status, 201);
    const ins1 = await res1.json();
    assert.equal(ins1.status, 'confirmada');

    // Segunda inscrição (entra na lista de espera)
    const res2 = await fetch(`http://localhost:${porta}/atividades/atv_lotada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(res2.status, 201);
    const ins2 = await res2.json();
    assert.equal(ins2.status, 'em_espera');
    assert.equal(ins2.posicaoNaEspera, 1);
  } finally {
    app.close();
  }
});

test('inscricao realizada apos o fechamento retorna 422 INSCRICOES_ENCERRADAS (R1)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_fechada',
        titulo: 'Palestra Fechada',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_f', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Relógio às 09:31 (menos de 30 min antes de 10:00)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:31:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_fechada/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'INSCRICOES_ENCERRADAS');
  } finally {
    app.close();
  }
});

test('usuario da organizacao tentando realizar inscricao recebe 403 SOMENTE_PARTICIPANTE (R9)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_r9',
        titulo: 'Palestra R9',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_r9', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const res = await fetch(`http://localhost:${porta}/atividades/atv_r9/inscricoes`, {
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

test('participante tenta realizar nova inscricao em atividade que ja possui inscricao ativa retorna 409 JA_INSCRITO (R2)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_r2',
        titulo: 'Palestra R2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_r2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    // Primeira inscrição
    const res1 = await fetch(`http://localhost:${porta}/atividades/atv_r2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res1.status, 201);

    // Segunda inscrição (mesma atividade, mesmo participante)
    const res2 = await fetch(`http://localhost:${porta}/atividades/atv_r2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res2.status, 409);
    const data = await res2.json();
    assert.equal(data.erro, 'JA_INSCRITO');
  } finally {
    app.close();
  }
});
