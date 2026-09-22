<template>
  <div class="fullscreen-qr" style="width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #fff; position: relative;">
    <div v-if="carregando">Carregando código...</div>
    <div v-else-if="erro" style="color: red; font-size: 24px;">
      {{ erro }}
    </div>
    <div v-else-if="codigoData" style="text-align: center;">
      <h1 style="font-size: 48px; margin-bottom: 20px;">Código do Encontro</h1>
      <div style="font-size: 80px; font-weight: bold; letter-spacing: 10px; border: 4px solid #333; padding: 40px; border-size: 20px; background: #f9f9f9;">
        {{ codigoData.codigo }}
      </div>
      <p style="margin-top: 20px; font-size: 20px;">Próxima troca em: {{ new Date(codigoData.trocaEm).toLocaleTimeString() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  encontroId: {
    type: String,
    required: true
  },
  usuario: {
    type: String,
    default: 'org-ana'
  }
});

const carregando = ref(true);
const erro = ref('');
const codigoData = ref(null);
let timer = null;

async function buscarCodigo() {
  carregando.value = true;
  erro.value = '';
  try {
    const res = await fetch(`/encontros/${props.encontroId}/codigo`, {
      headers: {
        'X-Usuario': props.usuario
      }
    });
    if (!res.ok) {
      const data = await res.json();
      erro.value = data.erro || 'ERRO_DESCONHECIDO';
      carregando.value = false;
      return;
    }
    const data = await res.json();
    codigoData.value = data;
    carregando.value = false;

    // Schedule next fetch based on trocaEm
    if (data.trocaEm) {
      const agora = new Date().getTime();
      const trocaMs = new Date(data.trocaEm).getTime();
      const diff = Math.max(1000, trocaMs - agora);
      if (timer) clearTimeout(timer);
      timer = setTimeout(buscarCodigo, diff);
    }
  } catch (e) {
    erro.value = 'FALHA_CONEXAO';
    carregando.value = false;
  }
}

onMounted(() => {
  buscarCodigo();
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>
