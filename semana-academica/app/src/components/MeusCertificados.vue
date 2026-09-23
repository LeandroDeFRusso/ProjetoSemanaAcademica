<template>
  <div>
    <h1>Meus Certificados</h1>
    <div v-if="loading">Carregando...</div>
    <div v-else-if="erroGeral" class="error">{{ erroGeral }}</div>
    <div v-else>
      <div class="emissao-form">
        <h3>Emitir Certificado</h3>
        <input 
          type="text" 
          v-model="atividadeIdInput" 
          placeholder="ID da Atividade" 
          data-testid="atividade-id-input" 
        />
        <button @click="emitirCertificado" data-testid="emitir-btn">Emitir</button>
        <div v-if="erroEmissao" class="error" data-testid="erro-emissao">{{ erroEmissao }}</div>
      </div>

      <div v-if="certificados.length === 0">Nenhum certificado emitido.</div>
      <ul v-else>
        <li v-for="cert in certificados" :key="cert.codigo">
          Código: {{ cert.codigo }} - Atividade: {{ cert.atividadeId }} - Carga Horária: {{ cert.cargaHorariaMinutos }} min (Emitido em: {{ cert.emitidoEm }})
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

const certificados = ref([]);
const loading = ref(true);
const erroGeral = ref(null);
const atividadeIdInput = ref('');
const erroEmissao = ref(null);

async function carregarCertificados() {
  try {
    const res = await fetch('/certificados', {
      headers: { 'X-Usuario': props.usuario }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao carregar certificados');
    }
    certificados.value = data;
  } catch (e) {
    erroGeral.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function emitirCertificado() {
  erroEmissao.value = null;
  if (!atividadeIdInput.value) return;
  try {
    const res = await fetch(`/atividades/${atividadeIdInput.value}/certificado`, {
      method: 'POST',
      headers: { 'X-Usuario': props.usuario }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao emitir certificado');
    }
    const index = certificados.value.findIndex(c => c.codigo === data.codigo);
    if (index === -1) {
      certificados.value.push(data);
    }
    atividadeIdInput.value = '';
  } catch (e) {
    erroEmissao.value = e.message;
  }
}

onMounted(carregarCertificados);
</script>
