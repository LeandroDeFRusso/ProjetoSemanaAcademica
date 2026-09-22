import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import MinhasInscricoes from '../src/components/MinhasInscricoes.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MinhasInscricoes', () => {
  it('deve listar as inscrições', async () => {
    const wrapper = mount(MinhasInscricoes);

    // Wait for API call and Vue updates
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Atividade: ins_1');
    expect(wrapper.text()).toContain('Status: confirmada');
  });

  it('deve mostrar mensagem quando não houver inscrições', async () => {
    server.use(
      http.get('/inscricoes', () => {
        return HttpResponse.json([]);
      })
    );

    const wrapper = mount(MinhasInscricoes);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Nenhuma inscrição encontrada.');
  });

  it('deve mostrar status convocada e botão de confirmar', async () => {
    server.use(
      http.get('/inscricoes', () => {
        return HttpResponse.json([
          {
            id: 'ins_conv',
            atividadeId: 'atv_1',
            participanteId: 'p-carla',
            status: 'convocada',
            posicaoNaEspera: null,
            convocadaAte: '2026-10-19T10:00:00-03:00',
            criadaEm: '2026-10-19T08:00:00-03:00'
          }
        ]);
      })
    );

    const wrapper = mount(MinhasInscricoes);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Status: convocada');
    expect(wrapper.text()).toContain('Convocação até: 2026-10-19T10:00:00-03:00');
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Confirmar');
  });

  it('deve mostrar posição na espera quando status for em_espera', async () => {
    server.use(
      http.get('/inscricoes', () => {
        return HttpResponse.json([
          {
            id: 'ins_espera',
            atividadeId: 'atv_2',
            participanteId: 'p-carla',
            status: 'em_espera',
            posicaoNaEspera: 5,
            convocadaAte: null,
            criadaEm: '2026-10-19T08:00:00-03:00'
          }
        ]);
      })
    );

    const wrapper = mount(MinhasInscricoes);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Status: em_espera');
    expect(wrapper.text()).toContain('Posição na espera: 5');
  });
});
