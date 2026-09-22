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
        id: 'atv_1a2b3c4d',
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
  })
];
