<template>
  <div v-if="atividade">
    <h1>{{ atividade.titulo }}</h1>
    <p>Tipo: {{ atividade.tipo }}</p>
    <p>Vagas: {{ atividade.vagas }}</p>
    <ul>
      <li v-for="encontro in atividade.encontros" :key="encontro.id">
        {{ encontro.inicio }} - {{ encontro.fim }}
      </li>
    </ul>
  </div>
  <div v-else>
    Carregando...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['atividadeId']);
const atividade = ref(null);

onMounted(async () => {
  const res = await fetch(`/atividades/${props.atividadeId}`);
  atividade.value = await res.json();
});
</script>
