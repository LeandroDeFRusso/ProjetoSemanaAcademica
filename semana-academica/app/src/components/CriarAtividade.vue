<template>
  <form @submit.prevent="criarAtividade">
    <input v-model="form.titulo" placeholder="Título" />
    <select v-model="form.tipo">
      <option value="palestra">Palestra</option>
      <option value="minicurso">Minicurso</option>
    </select>
    <button type="submit">Criar</button>
    <div id="erro-container" v-if="erro" style="color: red;">{{ erro }}</div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';

const form = reactive({ titulo: '', tipo: 'palestra' });
const erro = ref('');

async function criarAtividade() {
  erro.value = '';
  // Ajuste para enviar estrutura válida para o mock (mas que dispara o erro configurado)
  const res = await fetch('/atividades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Usuario': 'org-ana' },
    body: JSON.stringify({ ...form, salaId: 'auditorio', vagas: 10, encontros: [] })
  });
  
  if (!res.ok) {
    const data = await res.json();
    erro.value = data.erro;
  }
}
</script>
