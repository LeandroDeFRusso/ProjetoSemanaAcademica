import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidor } from '../src/server.js';

test('GET /certificados/:codigo com código válido retorna 200 (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    await fetch(`http://localhost:${porta}/_teste/reset`, { method: 'POST' });

    // 1. Setup: Criar atividade, inscrever participante, registrar presença e emitir certificado
    await fetch(`http://localhost:${porta}/_teste/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({
        id: 'atv_fatia3_1',
        titulo: 'Palestra para Teste',
        tipo: 'palestra',
        salaId: 'auditorio',
        vagas: 50,
        encontros: [{ id: 'enc_f3_1', inicio: '2026-10-19T10:00:00-03:00', fim: '2026-10-19T12:00:00-03:00' }],
        cancelada: 0
      })
    });
    
    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T09:00:00-03:00' })
    });

    await fetch(`http://localhost:${porta}/atividades/atv_fatia3_1/inscricoes`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });

    await fetch(`http://localhost:${porta}/_teste/relogio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agora: '2026-10-19T13:00:00-03:00' })
    });
    
    // Forçar confirmação da inscrição diretamente no banco (ou via endpoint de teste se houver)
    // Na verdade, o endpoint POST /atividades/:id/inscricoes coloca como solicitada. Para confirmar, precisamos aprovar.
    // Vamos usar o mecanismo de teste ou atualizar no banco se pudermos, ou ver como a fatia 1 fez.
    // Na fatia 1 (m4-fatia1.spec.js):
    // Ela se inscreveu, mas esqueceu de confirmar? Vamos ver como o teste da fatia 1 fez.
    // Na fatia 1, o teste m4-fatia1.spec.js fez:
    // const inscRes = await fetch(`http://localhost:${porta}/atividades/atv_m4_4/inscricoes`, { method: 'POST', headers: { 'X-Usuario': 'p-joao' } });
    // assert.equal(inscRes.status, 201);
    // Mas talvez a atividade precisasse de vagas ou outra coisa? Aqui vagas é 50.
    // Ah, o status da inscrição depende de aprovação ou é confirmada direto se não houver fila?
    // Vamos verificar o código de inscrições no servidor.
    
    await fetch(`http://localhost:${porta}/encontros/enc_f3_1/presencas/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
      body: JSON.stringify({ participanteId: 'p-joao', justificativa: 'Justificativa longa e válida' })
    });

    const resEmissao = await fetch(`http://localhost:${porta}/atividades/atv_fatia3_1/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': 'p-joao' }
    });
    const cert = await resEmissao.json();
    assert.equal(resEmissao.status, 201);
    const codigo = cert.codigo;
    assert.ok(codigo);

    // 2. Testar a rota pública
    const res = await fetch(`http://localhost:${porta}/certificados/${codigo.toLowerCase()}`);
    
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.codigo, codigo);
    assert.equal(data.participante, 'João Pedro Martins');
    assert.equal(data.atividade, 'Palestra para Teste');
  } finally {
    app.close();
  }
});

test('GET /certificados/:codigo com código inexistente ou inválido retorna 404 (R5)', async () => {
  process.env.MODO_TESTE = '1';
  const { app, porta } = await criarServidor(0);

  try {
    const res = await fetch(`http://localhost:${porta}/certificados/SA26-INEXISTENTE`);
    assert.equal(res.status, 404);
  } finally {
    app.close();
  }
});
