import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ExtratoHoras from '../src/components/ExtratoHoras.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExtratoHoras', () => {
  it('deve carregar e exibir o extrato de horas corretamente', async () => {
    const wrapper = mount(ExtratoHoras);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Palestra Exemplo');
    expect(wrapper.text()).toContain('Minicurso Exemplo');
    expect(wrapper.text()).toContain('Palestras: 120 min');
    expect(wrapper.text()).toContain('Minicursos: 180 min');
    expect(wrapper.text()).toContain('Total Bruto: 300 min');
    expect(wrapper.text()).toContain('Total Aproveitado: 300 min');
  });

  it('deve exibir mensagem quando houver erro ao carregar extrato', async () => {
    server.use(
      http.get('/extrato', () => {
        return HttpResponse.json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Erro' }, { status: 401 });
      })
    );

    const wrapper = mount(ExtratoHoras);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('USUARIO_DESCONHECIDO');
  });
});
