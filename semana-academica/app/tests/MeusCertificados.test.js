import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import MeusCertificados from '../src/components/MeusCertificados.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MeusCertificados', () => {
  it('deve listar os certificados emitidos', async () => {
    const wrapper = mount(MeusCertificados);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('SA26-ABCD-1234');
    expect(wrapper.text()).toContain('Atividade: atv_1');
  });

  it('deve mostrar mensagem quando não houver certificados', async () => {
    server.use(
      http.get('/certificados', () => {
        return HttpResponse.json([]);
      })
    );

    const wrapper = mount(MeusCertificados);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Nenhum certificado emitido.');
  });

  it('deve emitir certificado com sucesso e atualizar a lista', async () => {
    const wrapper = mount(MeusCertificados);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    // Fill activity id input and click emit
    const input = wrapper.find('input[data-testid="atividade-id-input"]');
    await input.setValue('atv_nova');
    const button = wrapper.find('button[data-testid="emitir-btn"]');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('atv_nova');
  });

  it('deve exibir erro quando emissão falhar por atividade não encerrada', async () => {
    server.use(
      http.post('/atividades/:id/certificado', () => {
        return HttpResponse.json({ erro: 'ATIVIDADE_NAO_ENCERRADA', mensagem: 'Atividade não encerrada' }, { status: 422 });
      })
    );

    const wrapper = mount(MeusCertificados);

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    const input = wrapper.find('input[data-testid="atividade-id-input"]');
    await input.setValue('atv_nao_encerrada');
    const button = wrapper.find('button[data-testid="emitir-btn"]');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('ATIVIDADE_NAO_ENCERRADA');
  });
});
