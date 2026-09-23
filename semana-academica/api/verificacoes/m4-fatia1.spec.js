import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('POST /atividades/:id/certificado por usuario da organizacao retorna 403 (R6)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m4_1',
        titulo: 'Palestra Certificado',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m4_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    const res = await fetch(`http://localhost:${porta}/atividades/atv_m4_1/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res.status, 403);
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/certificado antes do fim do ultimo encontro retorna 422 ATIVIDADE_NAO_ENCERRADA (R2)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m4_2',
        titulo: 'Palestra Em Andamento',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m4_2', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:00:00-03:00' })
    });

    const res = await fetch(`http://localhost:${porta}/atividades/atv_m4_2/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'ATIVIDADE_NAO_ENCERRADA');
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/certificado com frequencia inferior a 75% retorna 422 PRESENCA_INSUFICIENTE (R1)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Minicurso com 4 encontros
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m4_3',
        titulo: 'Minicurso Teste',
        tipo: 'minicurso',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m4_3_1', inicio: '2026-10-19T08:00:00-03:00', fim: '2026-10-19T10:00:00-03:00' },
          { id: 'enc_m4_3_2', inicio: '2026-10-19T10:15:00-03:00', fim: '2026-10-19T12:15:00-03:00' },
          { id: 'enc_m4_3_3', inicio: '2026-10-20T08:00:00-03:00', fim: '2026-10-20T10:00:00-03:00' },
          { id: 'enc_m4_3_4', inicio: '2026-10-20T10:15:00-03:00', fim: '2026-10-20T12:15:00-03:00' }
        ],
        cancelada: 0
      })
    });
    assert.equal(atvRes.status, 201);

    // Relógio após último encontro
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-20T13:00:00-03:00' })
    });

    // Participante p-joao tem 2 presenças em 4 encontros (50% < 75%)
    // Vamos registrar 2 presenças manualmente (ou via presenças)
    for (const encId of ['enc_m4_3_1', 'enc_m4_3_2']) {
      await fetch(`http://localhost:${porta}/encontros/${encId}/presencas/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
        body: JSON.stringify({
          participanteId: 'p-joao',
          justificativa: 'Participação válida no encontro'
        })
      });
    }

    const res = await fetch(`http://localhost:${porta}/atividades/atv_m4_3/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.erro, 'PRESENCA_INSUFICIENTE');
  } finally {
    app.close();
  }
});

test('POST /atividades/:id/certificado com frequencia >= 75% gera certificado (201 na 1a, 200 nas seguintes) e GET /certificados lista (R3, R6)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Palestra com 1 encontro
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_m4_4',
        titulo: 'Palestra Sucesso',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [
          { id: 'enc_m4_4', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
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

    // Inscrever p-joao
    const inscRes = await fetch(`http://localhost:${porta}/atividades/atv_m4_4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(inscRes.status, 201);

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T13:00:00-03:00' })
    });

    // Registrar presença (100% >= 75%)
    await fetch(`http://localhost:${porta}/encontros/enc_m4_4/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        participanteId: 'p-joao',
        justificativa: 'Participação integral na palestra'
      })
    });

    // 1ª emissão -> 201
    const res1 = await fetch(`http://localhost:${porta}/atividades/atv_m4_4/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(res1.status, 201);
    const cert1 = await res1.json();
    assert.equal(cert1.atividadeId, 'atv_m4_4');
    assert.equal(cert1.participanteId, 'p-joao');
    assert.equal(cert1.encontros, 1);
    assert.equal(cert1.presencas, 1);
    assert.match(cert1.codigo, /^SA26-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    assert.ok(cert1.emitidoEm);

    // 2ª emissão -> 200 (idempotente, mesmo código)
    const res2 = await fetch(`http://localhost:${porta}/atividades/atv_m4_4/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(res2.status, 200);
    const cert2 = await res2.json();
    assert.equal(cert2.codigo, cert1.codigo);

    // GET /certificados -> lista o certificado emitido
    const resList = await fetch(`http://localhost:${porta}/certificados`, {
      headers: { 'X-Usuario': 'p-joao' }
    });
    assert.equal(resList.status, 200);
    const lista = await resList.json();
    assert.equal(lista.length, 1);
    assert.equal(lista[0].codigo, cert1.codigo);
  } finally {
    app.close();
  }
});

test('GET /certificados sem autenticacao retorna 401 e por organizacao retorna 403 (R6)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    const res401 = await fetch(`http://localhost:${porta}/certificados`);
    assert.equal(res401.status, 401);

    const res403 = await fetch(`http://localhost:${porta}/certificados`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res403.status, 403);
  } finally {
    app.close();
  }
});

test('GET /extrato sem autenticacao retorna 401 e por organizacao retorna 403 (R6)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);
  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });
    const res401 = await fetch(`http://localhost:${porta}/extrato`);
    assert.equal(res401.status, 401);

    const res403 = await fetch(`http://localhost:${porta}/extrato`, {
      headers: { 'X-Usuario': 'org-ana' }
    });
    assert.equal(res403.status, 403);
  } finally {
    app.close();
  }
});
