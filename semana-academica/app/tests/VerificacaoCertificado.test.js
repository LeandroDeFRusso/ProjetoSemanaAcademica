import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import VerificacaoCertificado from '../src/components/VerificacaoCertificado.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('VerificacaoCertificado', () => {
  it('deve verificar certificado válido pelo código com sucesso', async () => {
    const wrapper = mount(VerificacaoCertificado);

    const input = wrapper.find('input[data-testid="codigo-input"]');
    await input.setValue('SA26-ABCD-1234');
    const button = wrapper.find('button[data-testid="verificar-btn"]');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Carla Mendes Souza');
    expect(wrapper.text()).toContain('Palestra Exemplo');
    expect(wrapper.text()).toContain('120 min');
  });

  it('deve exibir erro 404 quando certificado for inválido ou inexistente', async () => {
    const wrapper = mount(VerificacaoCertificado);

    const input = wrapper.find('input[data-testid="codigo-input"]');
    await input.setValue('SA26-INEXISTENTE');
    const button = wrapper.find('button[data-testid="verificar-btn"]');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Certificado não encontrado');
  });
});
