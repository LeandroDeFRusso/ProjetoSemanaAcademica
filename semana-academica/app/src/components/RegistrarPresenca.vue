<template>
  <div class="registrar-presenca">
    <h2>Registrar Presença</h2>
    <div v-if="sucessoMsg" class="sucesso" style="color: green; margin-bottom: 10px;">
      {{ sucessoMsg }}
    </div>
    <div v-if="erro" class="erro" style="color: red; margin-bottom: 10px;">
      {{ erro }}
    </div>

    <div class="form-group" style="margin-bottom: 15px;">
      <label for="codigo-input">Código do Encontro (ou QR Code):</label>
      <input
        id="codigo-input"
        v-model="codigoInput"
        type="text"
        placeholder="Digite o código (ex: ABC123)"
        style="padding: 8px; font-size: 16px; width: 100%; margin-top: 5px;"
      />
    </div>

    <div class="acoes" style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button @click="registrar('qr')" :disabled="carregando || !codigoInput.trim()" style="padding: 10px 20px;">
        {{ carregando ? 'Registrando...' : 'Registrar Online' }}
      </button>
      <button @click="simularCamera" style="padding: 10px 20px;">
        Ler via Câmera (Simular QR)
      </button>
    </div>

    <div v-if="offlineQueue.length > 0" class="offline-queue" style="background: #fff3cd; padding: 10px; border: 1px solid #ffeeba; margin-top: 20px;">
      <p>Registros salvos offline (aguardando rede): {{ offlineQueue.length }}</p>
      <button @click="sincronizarOffline" style="padding: 5px 10px;">Sincronizar Agora</button>
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
    default: 'p-carla'
  }
});

const codigoInput = ref('');
const carregando = ref(false);
const erro = ref('');
const sucessoMsg = ref('');
const offlineQueue = ref([]);

onMounted(() => {
  const saved = localStorage.getItem(`offline_presencas_${props.encontroId}`);
  if (saved) {
    try {
      offlineQueue.value = JSON.parse(saved);
    } catch (e) {
      offlineQueue.value = [];
    }
  }

  window.addEventListener('online', sincronizarOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', sincronizarOffline);
});

function salvarOffline(payload) {
  offlineQueue.value.push(payload);
  localStorage.setItem(`offline_presencas_${props.encontroId}`, JSON.stringify(offlineQueue.value));
  sucessoMsg.value = 'Sem internet. Leitura guardada offline.';
  erro.value = '';
}

async function registrar(tipoOrigem = 'qr', codigoOverride = null, lidoEmOverride = null) {
  const codigo = codigoOverride || codigoInput.value.trim();
  if (!codigo) {
    erro.value = 'Informe o código do encontro.';
    return;
  }

  carregando.value = true;
  erro.value = '';
  sucessoMsg.value = '';

  const lidoEm = lidoEmOverride || (tipoOrigem === 'qr_offline' ? new Date().toISOString() : null);
  const payload = { codigo, ...(lidoEm ? { lidoEm } : {}) };

  try {
    const res = await fetch(`/encontros/${props.encontroId}/presencas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': props.usuario
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      erro.value = data.erro || 'ERRO_DESCONHECIDO';
      carregando.value = false;
      return;
    }

    sucessoMsg.value = `Presença registrada com sucesso! (ID: ${data.id})`;
    codigoInput.value = '';
    carregando.value = false;
  } catch (e) {
    salvarOffline({
      codigo,
      lidoEm: lidoEm || new Date().toISOString()
    });
    carregando.value = false;
  }
}

function simularCamera() {
  codigoInput.value = 'ABC123';
  registrar('qr_offline', 'ABC123', new Date().toISOString());
}

async function sincronizarOffline() {
  if (offlineQueue.value.length === 0) return;
  const queueCopy = [...offlineQueue.value];
  const remaining = [];

  for (const item of queueCopy) {
    try {
      const res = await fetch(`/encontros/${props.encontroId}/presencas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario': props.usuario
        },
        body: JSON.stringify({
          codigo: item.codigo,
          lidoEm: item.lidoEm
        })
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 422 || res.status === 403) {
          erro.value = `Erro ao sincronizar item offline: ${data.erro}`;
        } else {
          remaining.push(item);
        }
      }
    } catch (e) {
      remaining.push(item);
    }
  }

  offlineQueue.value = remaining;
  localStorage.setItem(`offline_presencas_${props.encontroId}`, JSON.stringify(offlineQueue.value));
  if (remaining.length === 0 && offlineQueue.value.length === 0) {
    sucessoMsg.value = 'Todos os registros offline foram sincronizados!';
  }
}
</script>
