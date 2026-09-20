<template>
  <div>
    <h1>Grade de Atividades</h1>
    <input v-model="dia" type="date" />
    <select v-model="tipo">
      <option value="">Todos</option>
      <option value="palestra">Palestra</option>
      <option value="minicurso">Minicurso</option>
    </select>
    <button @click="fetchAtividades">Filtrar</button>
    <ul>
      <li v-for="atv in atividades" :key="atv.id">{{ atv.titulo }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const atividades = ref([]);
const dia = ref('');
const tipo = ref('');

async function fetchAtividades() {
  let url = '/atividades?';
  if (dia.value) url += `dia=${dia.value}&`;
  if (tipo.value) url += `tipo=${tipo.value}&`;
  const res = await fetch(url);
  atividades.value = await res.json();
}

onMounted(fetchAtividades);
</script>
