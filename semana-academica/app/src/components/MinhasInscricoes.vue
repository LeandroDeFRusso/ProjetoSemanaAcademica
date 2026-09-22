<template>
  <div>
    <h1>Minhas Inscrições</h1>
    <div v-if="loading">Carregando...</div>
    <div v-else-if="erro">{{ erro }}</div>
    <div v-else-if="inscricoes.length === 0">Nenhuma inscrição encontrada.</div>
    <ul v-else>
      <li v-for="inscricao in inscricoes" :key="inscricao.id">
        Atividade: {{ inscricao.atividadeId }} - Status: {{ inscricao.status }}
        <span v-if="inscricao.posicaoNaEspera"> (Posição na espera: {{ inscricao.posicaoNaEspera }})</span>
        <span v-if="inscricao.convocadaAte"> - Convocação até: {{ inscricao.convocadaAte }}</span>
        <button v-if="inscricao.status === 'convocada'" @click="confirmar(inscricao.id)">Confirmar</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const inscricoes = ref([]);
const loading = ref(true);
const erro = ref(null);

onMounted(async () => {
  try {
    const res = await fetch('/inscricoes');
    if (!res.ok) throw new Error('Erro ao carregar inscrições');
    inscricoes.value = await res.json();
  } catch (e) {
    erro.value = e.message;
  } finally {
    loading.value = false;
  }
});

async function confirmar(id) {
  try {
    const res = await fetch(`/inscricoes/${id}/confirmacao`, { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao confirmar inscrição');
    const index = inscricoes.value.findIndex(i => i.id === id);
    if (index !== -1) {
      inscricoes.value[index].status = 'confirmada';
      inscricoes.value[index].convocadaAte = null;
    }
  } catch (e) {
    alert(e.message);
  }
}
</script>
