<template>
  <div>
    <h1>Extrato de Horas</h1>
    <div v-if="loading">Carregando...</div>
    <div v-else-if="erro" class="error">{{ erro }}</div>
    <div v-else>
      <div class="resumo">
        <p>Palestras: {{ extrato.palestrasMinutos }} min</p>
        <p>Minicursos: {{ extrato.minicursosMinutos }} min</p>
        <p>Total Bruto: {{ extrato.totalMinutos }} min</p>
        <p>Total Aproveitado: {{ extrato.aproveitadoMinutos }} min</p>
      </div>
      <h3>Atividades Registradas</h3>
      <ul>
        <li v-for="item in extrato.itens" :key="item.atividadeId">
          {{ item.titulo }} ({{ item.tipo }}) - {{ item.cargaHorariaMinutos }} min — Código: {{ item.codigo || 'Não emitido' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  usuario: {
    type: String,
    default: 'p-carla'
  }
});

const extrato = ref(null);
const loading = ref(true);
const erro = ref(null);

onMounted(async () => {
  try {
    const res = await fetch('/extrato', {
      headers: { 'X-Usuario': props.usuario }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao carregar extrato');
    }
    extrato.value = data;
  } catch (e) {
    erro.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>
