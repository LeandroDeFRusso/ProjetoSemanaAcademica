import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import CodigoEncontro from '../src/components/CodigoEncontro.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CodigoEncontro (M3 Fatia 1)', () => {
  it('deve buscar e exibir o código do encontro em tela cheia', async () => {
    const wrapper = mount(CodigoEncontro, {
      props: { encontroId: 'enc_1' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('ABC123');
    expect(wrapper.classes()).toContain('fullscreen-qr') || expect(wrapper.find('.fullscreen-qr').exists()).toBe(true);
  });

  it('deve exibir erro 422 FORA_DA_JANELA quando fora da janela de registro', async () => {
    server.use(
      http.get('/encontros/:id/codigo', () => {
        return HttpResponse.json({ erro: 'FORA_DA_JANELA', mensagem: 'Fora da janela' }, { status: 422 });
      })
    );

    const wrapper = mount(CodigoEncontro, {
      props: { encontroId: 'enc_1' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('FORA_DA_JANELA');
  });

  it('deve exibir erro 403 SOMENTE_ORGANIZACAO quando chamado por participante', async () => {
    const wrapper = mount(CodigoEncontro, {
      props: { encontroId: 'enc_1', usuario: 'p-participante' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('SOMENTE_ORGANIZACAO');
  });
});
