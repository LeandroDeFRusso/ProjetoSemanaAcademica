<template>
  <div v-if="atividade">
    <h1>{{ atividade.titulo }}</h1>
    <p>Tipo: {{ atividade.tipo }}</p>
    <p>Vagas: {{ atividade.vagas }}</p>
    <ul v-if="atividade.encontros">
      <li v-for="encontro in atividade.encontros" :key="encontro.id">
        {{ encontro.inicio }} - {{ encontro.fim }}
      </li>
    </ul>
    <div v-if="inscricaoAtiva">
      <p>Status da inscrição: {{ inscricaoAtiva.status }}</p>
      <button v-if="['confirmada', 'em_espera', 'convocada'].includes(inscricaoAtiva.status)" @click="cancelar">Cancelar Inscrição</button>
    </div>
    <button v-else @click="inscrever">Inscrever-se</button>
  </div>
  <div v-else>
    Carregando...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['atividadeId']);
const atividade = ref(null);
const inscricaoAtiva = ref(null);

async function carregarDados() {
  const [atividadeRes, inscricoesRes] = await Promise.all([
    fetch(`/atividades/${props.atividadeId}`),
    fetch(`/inscricoes?atividadeId=${props.atividadeId}`)
  ]);
  atividade.value = await atividadeRes.json();
  const minhasInscricoes = await inscricoesRes.json();
  inscricaoAtiva.value = minhasInscricoes.find(i => ['confirmada', 'em_espera', 'convocada'].includes(i.status));
}

async function inscrever() {
  await fetch(`/atividades/${props.atividadeId}/inscricoes`, { method: 'POST' });
  await carregarDados();
}

async function cancelar() {
  await fetch(`/inscricoes/${inscricaoAtiva.value.id}/cancelamento`, { method: 'POST' });
  await carregarDados();
}

onMounted(carregarDados);

