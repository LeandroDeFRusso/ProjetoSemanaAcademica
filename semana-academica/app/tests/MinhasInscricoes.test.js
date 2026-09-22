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
});
