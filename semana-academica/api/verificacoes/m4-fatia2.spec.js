import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('GET /extrato calcula extrato com somas brutas (R4, R6)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Set date to enrollment time
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-14T09:00:00-03:00' })
    });

    // Palestras com 1 encontro, minicurso com 2
    const atividades = [
      {
        id: 'atv_1',
        titulo: 'Palestra A',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [{ id: 'e1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }], // 120min
        cancelada: 0
      },
      {
        id: 'atv_2',
        titulo: 'Minicurso B',
        tipo: 'minicurso',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'e2a', inicio: '2026-10-20T08:00:00-03:00', fim: '2026-10-20T10:00:00-03:00' },
          { id: 'e2b', inicio: '2026-10-21T08:00:00-03:00', fim: '2026-10-21T10:00:00-03:00' }
        ], // 240min
        cancelada: 0
      }
    ];

    for (const atv of atividades) {
        await fetch(`http://localhost:${porta}/_teste/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
        body: JSON.stringify(atv)
      });
    }

    // Registrar p-joao nas duas
    for (const atvId of ['atv_1', 'atv_2']) {
      const resInsc = await fetch(`http://localhost:${porta}/atividades/${atvId}/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': 'p-joao' }
      });
      assert.equal(resInsc.status, 201);

      // Confirmar inscrição
      const incsRes = await fetch(`http://localhost:${porta}/inscricoes`, {
        headers: { 'X-Usuario': 'p-joao' }
      });
      const incList = await incsRes.json();
      const inc = incList.find(i => i.atividadeId === atvId);
      const incId = inc.id;
      if (inc.status === 'convocada') {
        await fetch(`http://localhost:${porta}/inscricoes/${incId}/confirmacao`, {
          method: 'POST',
          headers: { 'X-Usuario': 'p-joao' }
        });
      }


      await fetch(`http://localhost:${porta}/encontros/${atvId === 'atv_1' ? 'e1' : 'e2'}/presencas/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
        body: JSON.stringify({ participanteId: 'p-joao', justificativa: 'justificativa valida' })
      });
    }


    const res = await fetch(`http://localhost:${porta}/extrato`, {
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(res.status, 200);
    const extrato = await res.json();

    assert.equal(extrato.palestrasMinutos, 120);
    assert.equal(extrato.minicursosMinutos, 240);
    assert.equal(extrato.totalMinutos, 360);
    assert.equal(extrato.aproveitadoMinutos, 360); // Sem tetos excedidos
    assert.equal(extrato.itens.length, 2);
  } finally {
    app.close();
  }
});

test('GET /extrato aplica tetos de aproveitamento (R4)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-14T09:00:00-03:00' })
    });

    const atividades = [
      { id: 'p1', titulo: 'P1', tipo: 'palestra', salaId: 'auditorio', vagas: 50, encontros: [{ id: 'e1', inicio: '2026-10-19T08:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' }], cancelada: 0 },
      { id: 'p2', titulo: 'P2', tipo: 'palestra', salaId: 'auditorio', vagas: 50, encontros: [{ id: 'e2', inicio: '2026-10-19T11:00:00-03:00', fim: '2026-10-19T13:00:00-03:00' }], cancelada: 0 },
      { id: 'p3', titulo: 'P3', tipo: 'palestra', salaId: 'auditorio', vagas: 50, encontros: [{ id: 'e3', inicio: '2026-10-19T14:00:00-03:00', fim: '2026-10-19T16:00:00-03:00' }], cancelada: 0 },
      { id: 'm1', titulo: 'M1', tipo: 'minicurso', salaId: 'auditorio', vagas: 50, encontros: [
          { id: 'e4a', inicio: '2026-10-20T08:00:00-03:00', fim: '2026-10-20T12:00:00-03:00' },
          { id: 'e4b', inicio: '2026-10-21T08:00:00-03:00', fim: '2026-10-21T12:00:00-03:00' }
      ], cancelada: 0 }
    ];

    for (const atv of atividades) {
        await fetch(`http://localhost:${porta}/_teste/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
        body: JSON.stringify(atv)
      });
    }

    for (const atv of atividades) {
      await fetch(`http://localhost:${porta}/atividades/${atv.id}/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': 'p-joao' }
      });
      // Registrar presença (100%)
      for (const enc of atv.encontros) {
        await fetch(`http://localhost:${porta}/encontros/${enc.id}/presencas/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
          body: JSON.stringify({ participanteId: 'p-joao', justificativa: 'justificativa valida' })
        });
      }
    }

    const res = await fetch(`http://localhost:${porta}/extrato`, {
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(res.status, 200);
    const extrato = await res.json();

    assert.equal(extrato.palestrasMinutos, 360);
    assert.equal(extrato.minicursosMinutos, 480);
    assert.equal(extrato.totalMinutos, 840);
    // 240 (teto palestras) + 480 (minicurso) = 720
    assert.equal(extrato.aproveitadoMinutos, 720);
  } finally {
    app.close();
  }
});
