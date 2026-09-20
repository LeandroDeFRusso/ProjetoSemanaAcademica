import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('GET /salas retorna a lista de salas', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  
  try {
    const res = await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    assert.equal(res.status, 204);

    const salasRes = await fetch(`http://localhost:${porta}/salas`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(salasRes.status, 200);
    const salas = await salasRes.json();
    assert.ok(Array.isArray(salas));
    assert.ok(salas.length >= 4);
    assert.equal(salas[0].id, 'auditorio');
    assert.equal(salas[0].nome, 'Auditório Central');
    assert.equal(salas[0].capacidade, 200);
  } finally {
    app.close();
  }
});

test('GET /atividades filtra por dia e tipo, ordena por R10 e calcula situacao por R12', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Inserir atividade de teste via rota de teste
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_b',
        titulo: 'Beta Palestra',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { id: 'enc_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_a',
        titulo: 'Alfa Minicurso',
        tipo: 'minicurso',
        salaId: 'lab-3',
        vagas: 20,
        encontros: [
          { id: 'enc_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T13:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    // Teste de ordenação R10 (mesmo horário, ordena por título: Alfa vem antes de Beta)
    const resList = await fetch(`http://localhost:${porta}/atividades?dia=2026-10-19`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(resList.status, 200);
    const lista = await resList.json();
    assert.equal(lista.length, 2);
    assert.equal(lista[0].titulo, 'Alfa Minicurso');
    assert.equal(lista[1].titulo, 'Beta Palestra');

    // Teste de filtro por tipo
    const resTipo = await fetch(`http://localhost:${porta}/atividades?tipo=palestra`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    const listaTipo = await resTipo.json();
    assert.equal(listaTipo.length, 1);
    assert.equal(listaTipo[0].titulo, 'Beta Palestra');

    // Teste de R12 (situação com relógio)
    // Relógio antes do início -> prevista
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });
    let atvRes = await fetch(`http://localhost:${porta}/atividades/atv_b`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    let atvData = await atvRes.json();
    assert.equal(atvData.situacao, 'prevista');

    // Relógio durante -> em_andamento
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:00:00-03:00' })
    });
    atvRes = await fetch(`http://localhost:${porta}/atividades/atv_b`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    atvData = await atvRes.json();
    assert.equal(atvData.situacao, 'em_andamento');

    // Relógio após -> encerrada
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T13:00:00-03:00' })
    });
    atvRes = await fetch(`http://localhost:${porta}/atividades/atv_b`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    atvData = await atvRes.json();
    assert.equal(atvData.situacao, 'encerrada');

  } finally {
    app.close();
  }
});

test('GET /atividades inclui atividades canceladas na listagem (R10)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'atv_canc_list',
        titulo: 'Palestra Cancelada na Lista',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 100,
        encontros: [
          { id: 'enc_cl', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 1
      })
    });

    const res = await fetch(`http://localhost:${porta}/atividades`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 200);
    const lista = await res.json();
    const encontrada = lista.find(a => a.id === 'atv_canc_list');
    assert.ok(encontrada);
    assert.equal(encontrada.situacao, 'cancelada');
  } finally {
    app.close();
  }
});
