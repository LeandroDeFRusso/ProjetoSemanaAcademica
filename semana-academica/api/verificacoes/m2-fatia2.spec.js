import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('participante tenta inscricao direta com sobreposicao de horario de outra atividade confirmada retorna 409 CONFLITO_DE_HORARIO (R4)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade 1 (10:00 - 12:00)
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_1',
        titulo: 'Palestra 1',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    // Criar atividade 2 sobreposta (11:00 - 13:00)
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_2',
        titulo: 'Palestra 2',
        tipo: 'palestra',
        salaId: 'sala-101',
        vagas: 10,
        encontros: [
          { id: 'enc_2', inicio: '2026-10-19T11:00:00-03:00', fim: '2026-10-19T13:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    // Carla se inscreve em atv_1 (confirma vaga)
    const res1 = await fetch(`http://localhost:${porta}/atividades/atv_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res1.status, 201);

    // Carla tenta se inscrever em atv_2 (conflito de horário)
    const res2 = await fetch(`http://localhost:${porta}/atividades/atv_2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res2.status, 409);
    const data = await res2.json();
    assert.equal(data.erro, 'CONFLITO_DE_HORARIO');
  } finally {
    app.close();
  }
});

test('participante realiza inscricao em horario que apenas encosta (10:00-12:00 e 12:00-14:00) com sucesso (R4)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar atividade 1 (10:00 - 12:00)
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_t1',
        titulo: 'Palestra 1',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_t1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    // Criar atividade 2 encostada (12:00 - 14:00)
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_t2',
        titulo: 'Palestra 2',
        tipo: 'palestra',
        salaId: 'sala-101',
        vagas: 10,
        encontros: [
          { id: 'enc_t2', inicio: '2026-10-19T12:00:00-03:00', fim: '2026-10-19T14:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    const res1 = await fetch(`http://localhost:${porta}/atividades/atv_t1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res1.status, 201);

    const res2 = await fetch(`http://localhost:${porta}/atividades/atv_t2/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res2.status, 201);
  } finally {
    app.close();
  }
});

test('participante tenta inscricao direta em um 4.º minicurso ocupando vaga retorna 422 LIMITE_DE_MINICURSOS (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar 3 minicursos em dias/horários diferentes
    for (let i = 1; i <= 3; i++) {
      await fetch(`http://localhost:${porta}/_teste/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
        body: JSON.stringify({
          id: `minic_${i}`,
          titulo: `Minicurso ${i}`,
          tipo: 'minicurso',
          salaId: 'sala-101',
          vagas: 10,
          encontros: [
            { id: `enc_m${i}_1`, inicio: `2026-10-1${9+i}T09:00:00-03:00`, fim: `2026-10-1${9+i}T11:00:00-03:00` },
            { id: `enc_m${i}_2`, inicio: `2026-10-1${9+i}T14:00:00-03:00`, fim: `2026-10-1${9+i}T16:00:00-03:00` }
          ],
          cancelada: 0
        })
      });
    }

    // Criar 4.º minicurso
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'minic_4',
        titulo: 'Minicurso 4',
        tipo: 'minicurso',
        salaId: 'sala-102',
        vagas: 10,
        encontros: [
          { id: 'enc_m4_1', inicio: '2026-10-23T09:00:00-03:00', fim: '2026-10-23T11:00:00-03:00' },
          { id: 'enc_m4_2', inicio: '2026-10-23T14:00:00-03:00', fim: '2026-10-23T16:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-13T09:00:00-03:00' })
    });

    // Carla se inscreve nos 3 primeiros minicursos
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`http://localhost:${porta}/atividades/minic_${i}/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': 'p-carla' }
      });
      assert.equal(res.status, 201);
    }

    // Carla tenta se inscrever no 4.º minicurso
    const res4 = await fetch(`http://localhost:${porta}/atividades/minic_4/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(res4.status, 422);
    const data = await res4.json();
    assert.equal(data.erro, 'LIMITE_DE_MINICURSOS');
  } finally {
    app.close();
  }
});

test('minicursos em espera e palestras nao contam para o limite de minicursos (R5, Criterio 11)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // Criar 3 minicursos
    for (let i = 1; i <= 3; i++) {
      await fetch(`http://localhost:${porta}/_teste/atividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
        body: JSON.stringify({
          id: `minic_${i}`,
          titulo: `Minicurso ${i}`,
          tipo: 'minicurso',
          salaId: 'sala-101',
          vagas: 10,
          encontros: [
            { id: `enc_m${i}_1`, inicio: `2026-10-1${9+i}T09:00:00-03:00`, fim: `2026-10-1${9+i}T11:00:00-03:00` },
            { id: `enc_m${i}_2`, inicio: `2026-10-1${9+i}T14:00:00-03:00`, fim: `2026-10-1${9+i}T16:00:00-03:00` }
          ],
          cancelada: 0
        })
      });
    }

    // Criar minicurso 4 lotado (vagas: 0)
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'minic_lotado',
        titulo: 'Minicurso Lotado',
        tipo: 'minicurso',
        salaId: 'sala-102',
        vagas: 0,
        encontros: [
          { id: 'enc_ml_1', inicio: '2026-10-23T09:00:00-03:00', fim: '2026-10-23T11:00:00-03:00' },
          { id: 'enc_ml_2', inicio: '2026-10-23T14:00:00-03:00', fim: '2026-10-23T16:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    // Criar palestra
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'palestra_1',
        titulo: 'Palestra Extra',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 10,
        encontros: [
          { id: 'enc_p1', inicio: '2026-10-23T17:00:00-03:00', fim: '2026-10-23T18:00:00-03:00' }
        ],
        cancelada: 0
      })
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-13T09:00:00-03:00' })
    });

    // Carla se inscreve nos 3 primeiros minicursos
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`http://localhost:${porta}/atividades/minic_${i}/inscricoes`, {
        method: 'POST',
        headers: { 'X-Usuario': 'p-carla' }
      });
      assert.equal(res.status, 201);
    }

    // Carla se inscreve no minicurso lotado (entra em espera) -> deve permitir (status em_espera)
    const resEsperas = await fetch(`http://localhost:${porta}/atividades/minic_lotado/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resEsperas.status, 201);
    const insEsp = await resEsperas.json();
    assert.equal(insEsp.status, 'em_espera');

    // Carla se inscreve na palestra -> deve permitir (status confirmada)
    const resPalestra = await fetch(`http://localhost:${porta}/atividades/palestra_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-carla' }
    });
    assert.equal(resPalestra.status, 201);
    const insPal = await resPalestra.json();
    assert.equal(insPal.status, 'confirmada');
  } finally {
    app.close();
  }
});



