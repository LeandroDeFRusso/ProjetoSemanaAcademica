import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import CriarAtividade from '../src/components/CriarAtividade.vue';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CriarAtividade', () => {
  it('deve mostrar erro ao criar atividade inválida', async () => {
    server.use(
      http.post('/atividades', () => {
        return HttpResponse.json({ erro: 'QUANTIDADE_DE_ENCONTROS' }, { status: 422 });
      })
    );

    const wrapper = mount(CriarAtividade);
    
    // Simulate form submission
    await wrapper.find('form').trigger('submit.prevent');
    
    // Wait for API call and Vue updates
    await new Promise(resolve => setTimeout(resolve, 200));
    await wrapper.vm.$nextTick();
    
    console.log(wrapper.html());
    
    expect(wrapper.find('#erro-container').exists()).toBe(true);
    expect(wrapper.find('#erro-container').text()).toContain('QUANTIDADE_DE_ENCONTROS');
  });
});
