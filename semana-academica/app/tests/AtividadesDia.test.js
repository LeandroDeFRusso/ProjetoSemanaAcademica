import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import AtividadesDia from '../src/components/AtividadesDia.vue';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AtividadesDia', () => {
  it('deve listar as atividades', async () => {
    const wrapper = mount(AtividadesDia);
    
    // Wait for API call (component will load activities)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(wrapper.find('h1').text()).toBe('Grade de Atividades');
    expect(wrapper.text()).toContain('Flutter do zero');
  });
});
