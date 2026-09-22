import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import RegistrarPresenca from '../src/components/RegistrarPresenca.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

describe('RegistrarPresenca (M3 Fatia 2)', () => {
  it('deve registrar presença com sucesso digitando o código e clicando em registrar', async () => {
    const wrapper = mount(RegistrarPresenca, {
      props: { encontroId: 'enc_1', usuario: 'p-carla' }
    });

    const input = wrapper.find('input');
    await input.setValue('ABC123');

    const button = wrapper.find('button');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Presença registrada com sucesso!');
  });

  it('deve exibir erro quando o código for inválido (CODIGO_INVALIDO)', async () => {
    const wrapper = mount(RegistrarPresenca, {
      props: { encontroId: 'enc_1', usuario: 'p-carla' }
    });

    const input = wrapper.find('input');
    await input.setValue('INVALID');

    const button = wrapper.find('button');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('CODIGO_INVALIDO');
  });

  it('deve guardar leitura offline e mostrar aviso quando sem internet', async () => {
    server.use(
      http.post('/encontros/:id/presencas', () => {
        return HttpResponse.error();
      })
    );

    const wrapper = mount(RegistrarPresenca, {
      props: { encontroId: 'enc_1', usuario: 'p-carla' }
    });

    const input = wrapper.find('input');
    await input.setValue('ABC123');

    const button = wrapper.find('button');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Sem internet. Leitura guardada offline.');
    expect(wrapper.text()).toContain('Registros salvos offline (aguardando rede): 1');
  });

  it('deve bloquear usuário da organização com SOMENTE_PARTICIPANTE', async () => {
    const wrapper = mount(RegistrarPresenca, {
      props: { encontroId: 'enc_1', usuario: 'org-ana' }
    });

    const input = wrapper.find('input');
    await input.setValue('ABC123');

    const button = wrapper.find('button');
    await button.trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('SOMENTE_PARTICIPANTE');
  });
});
