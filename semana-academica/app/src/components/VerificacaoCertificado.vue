<template>
  <div>
    <h1>Verificação de Certificado</h1>
    <div class="busca-form">
      <input 
        type="text" 
        v-model="codigoInput" 
        placeholder="Digite o código do certificado" 
        data-testid="codigo-input" 
      />
      <button @click="verificar" data-testid="verificar-btn">Verificar</button>
    </div>

    <div v-if="loading">Carregando...</div>
    <div v-if="erro" class="error" data-testid="erro-msg">{{ erro }}</div>
    <div v-if="resultado" class="resultado" data-testid="resultado-detalhes">
      <h3>Certificado Válido</h3>
      <p>Código: {{ resultado.codigo }}</p>
      <p>Participante: {{ resultado.participante }}</p>
      <p>Atividade: {{ resultado.atividade }}</p>
      <p>Carga Horária: {{ resultado.cargaHorariaMinutos }} min</p>
      <p>Emitido em: {{ resultado.emitidoEm }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const codigoInput = ref('');
const resultado = ref(null);
const erro = ref(null);
const loading = ref(false);

async function verificar() {
  erro.value = null;
  resultado.value = null;
  if (!codigoInput.value) return;

  loading.value = true;
  try {
    const res = await fetch(`/certificados/${codigoInput.value}`);
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Certificado não encontrado');
      }
      throw new Error(data.erro || 'Erro na verificação');
    }
    resultado.value = data;
  } catch (e) {
    erro.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>
