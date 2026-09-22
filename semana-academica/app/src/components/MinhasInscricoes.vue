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
        <span v-if="inscricao.convocadaAte && inscricao.status === 'convocada'"> - Convocação até: {{ formatarTempoRestante(inscricao.convocadaAte) }}</span>
        <button v-if="inscricao.status === 'convocada'" @click="confirmar(inscricao.id)">Confirmar</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const inscricoes = ref([]);
const loading = ref(true);
const erro = ref(null);
const agora = ref(new Date());
let timer = null;

function formatarTempoRestante(dataIso) {
  const diffMs = new Date(dataIso) - agora.value;
  if (diffMs <= 0) return 'Expirado';
  const diffSegundos = Math.floor(diffMs / 1000);
  const horas = Math.floor(diffSegundos / 3600);
  const minutos = Math.floor((diffSegundos % 3600) / 60);
  const segundos = diffSegundos % 60;
  return `${horas}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

onMounted(async () => {
  timer = setInterval(() => {
    agora.value = new Date();
  }, 1000);
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

onUnmounted(() => {
  clearInterval(timer);
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
