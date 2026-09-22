import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import GerenciarPresencas from '../src/components/GerenciarPresencas.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GerenciarPresencas (M3 Fatia 3)', () => {
  it('deve listar as presenças do encontro com sucesso para organização', async () => {
    server.use(
      http.get('/encontros/:id/presencas', () => {
        return HttpResponse.json([
          {
            id: 'pre_1',
            encontroId: 'enc_1',
            participanteId: 'p-carla',
            origem: 'qr',
            lidoEm: null,
            registradaEm: '2026-10-19T10:05:00-03:00',
            justificativa: null
          }
        ]);
      })
    );

    const wrapper = mount(GerenciarPresencas, {
      props: { encontroId: 'enc_1', usuario: 'org-ana' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('p-carla');
    expect(wrapper.text()).toContain('qr');
  });

  it('deve registrar presença manual com sucesso (201)', async () => {
    server.use(
      http.get('/encontros/:id/presencas', () => HttpResponse.json([])),
      http.post('/encontros/:id/presencas/manual', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          id: 'pre_manual_1',
          encontroId: 'enc_1',
          participanteId: body.participanteId,
          origem: 'manual',
          lidoEm: null,
          registradaEm: new Date().toISOString(),
          justificativa: body.justificativa
        }, { status: 201 });
      })
    );

    const wrapper = mount(GerenciarPresencas, {
      props: { encontroId: 'enc_1', usuario: 'org-ana' }
    });

    await wrapper.find('#participante-id-input').setValue('p-diego');
    await wrapper.find('#justificativa-input').setValue('Participou presencialmente na sala');
    await wrapper.find('#btn-registrar-manual').trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Presença manual registrada com sucesso!');
  });

  it('deve exibir erro 403 SOMENTE_ORGANIZACAO quando chamado por participante', async () => {
    const wrapper = mount(GerenciarPresencas, {
      props: { encontroId: 'enc_1', usuario: 'p-carla' }
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('SOMENTE_ORGANIZACAO');
  });

  it('deve exibir erro 403 NAO_INSCRITO no registro manual', async () => {
    server.use(
      http.get('/encontros/:id/presencas', () => HttpResponse.json([])),
      http.post('/encontros/:id/presencas/manual', () => {
        return HttpResponse.json({ erro: 'NAO_INSCRITO', mensagem: 'Não inscrito' }, { status: 403 });
      })
    );

    const wrapper = mount(GerenciarPresencas, {
      props: { encontroId: 'enc_1', usuario: 'org-ana' }
    });

    await wrapper.find('#participante-id-input').setValue('p-desconhecido');
    await wrapper.find('#justificativa-input').setValue('Justificativa válida com mais de 10 caracteres');
    await wrapper.find('#btn-registrar-manual').trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('NAO_INSCRITO');
  });

  it('deve exibir erro 422 JUSTIFICATIVA_OBRIGATORIA quando justificativa for curta', async () => {
    const wrapper = mount(GerenciarPresencas, {
      props: { encontroId: 'enc_1', usuario: 'org-ana' }
    });

    await wrapper.find('#participante-id-input').setValue('p-carla');
    await wrapper.find('#justificativa-input').setValue('Curta');
    await wrapper.find('#btn-registrar-manual').trigger('click');

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('JUSTIFICATIVA_OBRIGATORIA');
  });

  it('deve exibir erro 422 LIMITE_DE_MANUAIS', async () => {
    server.use(
      http.get('/encontros/:id/presencas', () => HttpResponse.json([])),
      http.post('/encontros/:id/presencas/manual', () => {
        return HttpResponse.json({ erro: 'LIMITE_DE_MANUAIS', mensagem: 'Limite excedido' }, { status: 422 });
      })
    );

    const wrapper = mount(GerenciarPresencas, {
      props: { encontroId: 'enc_1', usuario: 'org-ana' }
    });

    await wrapper.find('#participante-id-input').setValue('p-carla');
    await wrapper.find('#justificativa-input').setValue('Justificativa válida com mais de 10 caracteres');
    await wrapper.find('#btn-registrar-manual').trigger('click');

    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('LIMITE_DE_MANUAIS');
  });
});
