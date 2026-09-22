import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('POST /encontros/:id/presencas/manual por participante retorna 403 SOMENTE_ORGANIZACAO (R7)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_1',
        titulo: 'Palestra Manual 1',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f3_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_1/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'p-carla' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Participou presencialmente' })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'SOMENTE_ORGANIZACAO');
  } finally {
    app.close();
  }
});

test('GET /encontros/:id/presencas por participante retorna 403 SOMENTE_ORGANIZACAO (R6, R7)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_2',
        titulo: 'Palestra Manual 2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f3_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_2/presencas`, {
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'SOMENTE_ORGANIZACAO');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas/manual por participante sem inscricao confirmada retorna 403 NAO_INSCRITO (R4)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_3',
        titulo: 'Palestra Manual 3',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f3_3', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_3/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Justificativa válida com mais de 10 caracteres' })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.erro, 'NAO_INSCRITO');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas/manual com justificativa com menos de 10 caracteres ou ausente retorna 422 JUSTIFICATIVA_OBRIGATORIA (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_4',
        titulo: 'Palestra Manual 4',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f3_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Inscrever p-carla
    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_m3_f3_4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);

    // Tentativa com justificativa curta (< 10 chars)
    const resCurta = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_4/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Curta' })
    });
    assert.equal(resCurta.status, 422);
    const dataCurta = await resCurta.json();
    assert.equal(dataCurta.erro, 'JUSTIFICATIVA_OBRIGATORIA');

    // Tentativa sem justificativa (ausente)
    const resAusente = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_4/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla' })
    });
    assert.equal(resAusente.status, 422);
    const dataAusente = await resAusente.json();
    assert.equal(dataAusente.erro, 'JUSTIFICATIVA_OBRIGATORIA');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas/manual com sucesso retorna 201 na primeira vez e 200 nas subsequentes/duplicadas (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_5',
        titulo: 'Palestra Manual 5',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f3_5', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_m3_f3_5/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);

    const res1 = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_5/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Justificativa válida com mais de 10 caracteres' })
    });
    assert.equal(res1.status, 201);
    const data1 = await res1.json();
    assert.equal(data1.encontroId, 'enc_m3_f3_5');
    assert.equal(data1.participanteId, 'p-carla');
    assert.equal(data1.origem, 'manual');
    assert.equal(data1.justificativa, 'Justificativa válida com mais de 10 caracteres');

    // Tentativa duplicada
    const res2 = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_5/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Outra justificativa válida com mais de 10 caracteres' })
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.id, data1.id);
  } finally {
    app.close();
  }
});

test('GET /encontros/:id/presencas pela organizacao retorna 200 com [Presenca] (R6)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_6',
        titulo: 'Palestra Manual 6',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m3_f3_6', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const insRes = await fetch(`http://localhost:${porta}/atividades/atv_m3_f3_6/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(insRes.status, 201);

    await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_6/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Justificativa válida com mais de 10 caracteres' })
    });

    const res = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_6/presencas`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list));
    assert.equal(list.length, 1);
    assert.equal(list[0].participanteId, 'p-carla');
    assert.equal(list[0].origem, 'manual');
  } finally {
    app.close();
  }
});

test('POST /encontros/:id/presencas/manual excedendo o limite de 10% das inscricoes confirmadas retorna 422 LIMITE_DE_MANUAIS (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade com 5 vagas e 1 encontro
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m3_f3_7',
        titulo: 'Palestra Manual 7',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 5,
        encontros: [
          { id: 'enc_m3_f3_7', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Inscrever 3 participantes diferentes (p-carla, p-diego, p-elisa) -> 3 confirmadas
    for (const user of ['p-carla', 'p-diego', 'p-elisa']) {
      const insRes = await fetch(`http://localhost:${porta}/atividades/atv_m3_f3_7/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': user }
      });
      assert.equal(insRes.status, 201);
    }

    // 3 inscrições confirmadas -> 10% = 0.3 -> arredondando para cima = 1 presença manual permitida.
    // Registrar primeira presença manual (p-carla) -> sucesso (201)
    const res1 = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_7/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-carla', justificativa: 'Justificativa válida com mais de 10 caracteres' })
    });
    assert.equal(res1.status, 201);

    // Registrar segunda presença manual (p-diego) -> excede o limite (1) -> 422 LIMITE_DE_MANUAIS
    const res2 = await fetch(`http://localhost:${porta}/encontros/enc_m3_f3_7/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-diego', justificativa: 'Justificativa válida com mais de 10 caracteres' })
    });
    assert.equal(res2.status, 422);
    const data2 = await res2.json();
    assert.equal(data2.erro, 'LIMITE_DE_MANUAIS');
  } finally {
    app.close();
  }
});
