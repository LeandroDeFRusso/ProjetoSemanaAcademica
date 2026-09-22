import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('cancelamento de inscricao confirmada convoca automaticamente o primeiro da espera com status convocada e prazo de 2 horas (R6, Criterio 12)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade com 1 vaga
    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f4_1',
        titulo: 'Palestra Fatia 4',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 1,
        encontros: [
          { id: 'enc_1', inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
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

    // Carla se inscreve (confirmada)
    const resCarla = await fetch(`http://localhost:${porta}/atividades/atv_f4_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resCarla.status, 201);
    const insCarla = await resCarla.json();
    assert.equal(insCarla.status, 'confirmada');

    // Diego se inscreve (em_espera, posicao 1)
    const resDiego = await fetch(`http://localhost:${porta}/atividades/atv_f4_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(resDiego.status, 201);
    const insDiego = await resDiego.json();
    assert.equal(insDiego.status, 'em_espera');
    assert.equal(insDiego.posicaoNaEspera, 1);

    // Carla cancela sua inscrição
    const resCancel = await fetch(`http://localhost:${porta}/inscricoes/${insCarla.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resCancel.status, 200);

    // Consultar inscrição de Diego para verificar convocação automática
    const resDiegoGet = await fetch(`http://localhost:${porta}/inscricoes/${insDiego.id}`, {
      method: 'GET',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(resDiegoGet.status, 200);
    const diegoAtualizado = await resDiegoGet.json();
    assert.equal(diegoAtualizado.status, 'convocada');
    assert.equal(diegoAtualizado.posicaoNaEspera, null);
    assert.ok(diegoAtualizado.convocadaAte);
    
    // Verificar se o prazo convocadaAte é 2 horas após 09:00 (09:00 + 2h = 11:00)
    assert.equal(diegoAtualizado.convocadaAte, '2026-10-19T11:00:00-03:00');
  } finally {
    app.close();
  }
});

test('tentativa de confirmar inscricao sem convocacao retorna 422 SEM_CONVOCACAO (R7, Criterio 13)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    const atvRes = await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f4_2',
        titulo: 'Palestra Fatia 4.2',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_2', inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
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

    const resCarla = await fetch(`http://localhost:${porta}/atividades/atv_f4_2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resCarla.status, 201);
    const insCarla = await resCarla.json();
    assert.equal(insCarla.status, 'confirmada');

    // Carla tenta confirmar inscrição que está confirmada (não convocada)
    const resConf = await fetch(`http://localhost:${porta}/inscricoes/${insCarla.id}/confirmacao`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resConf.status, 422);
    const data = await resConf.json();
    assert.equal(data.erro, 'SEM_CONVOCACAO');
  } finally {
    app.close();
  }
});

test('confirmacao valida de convocacao retorna 200 com status confirmada (R7, Criterio 14)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f4_3',
        titulo: 'Palestra Fatia 4.3',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 1,
        encontros: [
          { id: 'enc_3', inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    const resCarla = await fetch(`http://localhost:${porta}/atividades/atv_f4_3/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    const insCarla = await resCarla.json();

    const resDiego = await fetch(`http://localhost:${porta}/atividades/atv_f4_3/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    const insDiego = await resDiego.json();

    // Carla cancela -> Diego convocado
    await fetch(`http://localhost:${porta}/inscricoes/${insCarla.id}/cancelamento`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });

    // Diego confirma dentro do prazo
    const resConf = await fetch(`http://localhost:${porta}/inscricoes/${insDiego.id}/confirmacao`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(resConf.status, 200);
    const confData = await resConf.json();
    assert.equal(confData.status, 'confirmada');
    assert.equal(confData.posicaoNaEspera, null);
    assert.equal(confData.convocadaAte, null);
  } finally {
    app.close();
  }
});

test('tentativa de confirmar apos convocadaAte retorna 422 CONVOCACAO_EXPIRADA e convoca proximo em cascata (R6, R7, Criterio 13)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_f4_4',
        titulo: 'Palestra Fatia 4.4',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 1,
        encontros: [
          { id: 'enc_4', inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    const insCarla = await (await fetch(`http://localhost:${porta}/atividades/atv_f4_4/inscricoes`, {
      method: 'POST', headers: { 'X-Usuario': 'p-carla' }
    })).json();

    const insDiego = await (await fetch(`http://localhost:${porta}/atividades/atv_f4_4/inscricoes`, {
      method: 'POST', headers: { 'X-Usuario': 'p-diego' }
    })).json();

    const insElisa = await (await fetch(`http://localhost:${porta}/atividades/atv_f4_4/inscricoes`, {
      method: 'POST', headers: { 'X-Usuario': 'p-elisa' }
    })).json();

    // Carla cancela -> Diego convocado (até 11:00)
    await fetch(`http://localhost:${porta}/inscricoes/${insCarla.id}/cancelamento`, {
      method: 'POST', headers: { 'X-Usuario': 'p-carla' }
    });

    // Avançar relógio para após 11:00 (11:01)
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T11:01:00-03:00' })
    });

    // Diego tenta confirmar após expiração -> 422 CONVOCACAO_EXPIRADA
    const resConf = await fetch(`http://localhost:${porta}/inscricoes/${insDiego.id}/confirmacao`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-diego' }
    });
    assert.equal(resConf.status, 422);
    const data = await resConf.json();
    assert.equal(data.erro, 'CONVOCACAO_EXPIRADA');

    // Verificar se Elisa foi convocada em cascata
    const resElisaGet = await fetch(`http://localhost:${porta}/inscricoes/${insElisa.id}`, {
      method: 'GET',
      headers: { 'X-Usuario': 'p-elisa' }
    });
    const elisaData = await resElisaGet.json();
    assert.equal(elisaData.status, 'convocada');
    // Prazo de Elisa contado a partir do vencimento de Diego (11:00 + 2h = 13:00, mas limitado ao fechamento 11:30)
    assert.equal(elisaData.convocadaAte, '2026-10-19T11:30:00-03:00');
  } finally {
    app.close();
  }
});

