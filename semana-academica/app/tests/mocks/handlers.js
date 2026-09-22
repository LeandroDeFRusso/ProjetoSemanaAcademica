import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/inscricoes', () => {
    return HttpResponse.json([
      {
        id: 'ins_1',
        atividadeId: 'atv_1',
        participanteId: 'p-carla',
        status: 'confirmada',
        posicaoNaEspera: null,
        convocadaAte: null,
        criadaEm: '2026-10-19T08:00:00-03:00'
      }
    ]);
  }),
  http.get('/atividades/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      titulo: 'Flutter do zero',
      tipo: 'minicurso',
      salaId: 'lab-3',
      vagas: 20,
      encontros: [{ id: 'enc_5e6f7a8b', inicio: '2026-10-19T19:00:00-03:00', fim: '2026-10-19T22:00:00-03:00' }],
      cargaHorariaMinutos: 180,
      situacao: 'prevista',
      ocupadas: 0,
      vagasRestantes: 20,
      emEspera: 0
    });
  }),
  http.post('/atividades', async ({ request }) => {
    const body = await request.json();
    if (body.tipo === 'palestra' && body.encontros.length !== 1) {
      return HttpResponse.json({ erro: 'QUANTIDADE_DE_ENCONTROS', mensagem: 'Palestra deve ter 1 encontro' }, { status: 422 });
    }
    // ... implementar outros erros conforme contrato se necessário
    return HttpResponse.json({ id: 'atv_novo123' }, { status: 201 });
  }),
  http.get('/atividades', ({ request }) => {
    return HttpResponse.json([
      {
        id: 'atv_atv1a2b3c4d',
        titulo: 'Flutter do zero',
        tipo: 'minicurso',
        salaId: 'lab-3',
        vagas: 20,
        encontros: [{ id: 'enc_5e6f7a8b', inicio: '2026-10-19T19:00:00-03:00', fim: '2026-10-19T22:00:00-03:00' }],
        cargaHorariaMinutos: 180,
        situacao: 'prevista',
        ocupadas: 0,
        vagasRestantes: 20,
        emEspera: 0
      }
    ]);
  }),
  http.post('/inscricoes/:id/confirmacao', ({ params }) => {
    return HttpResponse.json({ id: params.id, status: 'confirmada' }, { status: 200 });
  }),
  http.post('/atividades/:id/inscricoes', ({ params }) => {
    return HttpResponse.json({ id: 'ins_novo', atividadeId: params.id, status: 'confirmada' }, { status: 201 });
  }),
  http.post('/inscricoes/:id/cancelamento', ({ params }) => {
    return HttpResponse.json({ id: params.id, status: 'cancelada' }, { status: 200 });
  }),
  http.post('/encontros/:id/presencas', async ({ params, request }) => {
    const auth = request.headers.get('X-Usuario');
    if (auth === 'org-ana') {
      return HttpResponse.json({ erro: 'SOMENTE_PARTICIPANTE', mensagem: 'Apenas participante' }, { status: 403 });
    }
    const body = await request.json();
    if (body.codigo === 'INVALID') {
      return HttpResponse.json({ erro: 'CODIGO_INVALIDO', mensagem: 'Código inválido' }, { status: 422 });
    }
    if (body.codigo === 'NAO_INSCRITO') {
      return HttpResponse.json({ erro: 'NAO_INSCRITO', mensagem: 'Não inscrito' }, { status: 403 });
    }
    return HttpResponse.json({
      id: 'pre_12345678',
      encontroId: params.id,
      participanteId: auth || 'p-carla',
      origem: body.lidoEm ? 'qr_offline' : 'qr',
      lidoEm: body.lidoEm || null,
      registradaEm: new Date().toISOString(),
      justificativa: null
    }, { status: 201 });
  }),
  http.get('/encontros/:id/codigo', ({ params, request }) => {
    const auth = request.headers.get('X-Usuario');
    if (auth === 'p-participante') {
      return HttpResponse.json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização' }, { status: 403 });
    }
    return HttpResponse.json({
      encontroId: params.id,
      codigo: 'ABC123',
      trocaEm: new Date(Date.now() + 60000).toISOString(),
      validoAte: new Date(Date.now() + 120000).toISOString()
    });
  }),
  http.get('/encontros/:id/presencas', ({ params, request }) => {
    const auth = request.headers.get('X-Usuario');
    if (auth && auth.startsWith('p-')) {
      return HttpResponse.json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização' }, { status: 403 });
    }
    return HttpResponse.json([
      {
        id: 'pre_1',
        encontroId: params.id,
        participanteId: 'p-carla',
        origem: 'qr',
        lidoEm: null,
        registradaEm: '2026-10-19T10:05:00-03:00',
        justificativa: null
      }
    ]);
  }),
  http.post('/encontros/:id/presencas/manual', async ({ params, request }) => {
    const auth = request.headers.get('X-Usuario');
    if (auth && auth.startsWith('p-')) {
      return HttpResponse.json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização' }, { status: 403 });
    }
    const body = await request.json();
    if (!body.justificativa || body.justificativa.length < 10) {
      return HttpResponse.json({ erro: 'JUSTIFICATIVA_OBRIGATORIA', mensagem: 'Justificativa obrigatória (mínimo 10 caracteres)' }, { status: 422 });
    }
    if (body.participanteId === 'p-desconhecido') {
      return HttpResponse.json({ erro: 'NAO_INSCRITO', mensagem: 'Não inscrito' }, { status: 403 });
    }
    return HttpResponse.json({
      id: 'pre_manual_1',
      encontroId: params.id,
      participanteId: body.participanteId,
      origem: 'manual',
      lidoEm: null,
      registradaEm: new Date().toISOString(),
      justificativa: body.justificativa
    }, { status: 201 });
  })
];
