import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import AtividadeDetalhe from '../src/components/AtividadeDetalhe.vue';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AtividadeDetalhe', () => {
  it('deve exibir os detalhes da atividade', async () => {
    const wrapper = mount(AtividadeDetalhe, {
      props: {
        atividadeId: 'atv_1a2b3c4d'
      }
    });
    
    // Wait for API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(wrapper.text()).toContain('Flutter do zero');
    expect(wrapper.text()).toContain('Vagas: 20');
  });
});
