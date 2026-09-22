<template>
  <div class="gerenciar-presencas" style="padding: 20px;">
    <h2>Gerenciar Presenças do Encontro</h2>
    
    <div v-if="carregando">Carregando presenças...</div>
    <div v-if="erro" class="erro" style="color: red; margin-bottom: 15px; font-weight: bold;">
      {{ erro }}
    </div>
    <div v-if="sucessoMsg" class="sucesso" style="color: green; margin-bottom: 15px; font-weight: bold;">
      {{ sucessoMsg }}
    </div>

    <!-- Lista de Presenças -->
    <div class="lista-presencas" style="margin-bottom: 30px;">
      <h3>Lista de Presenças Registradas ({{ presencas.length }})</h3>
      <ul v-if="presencas.length > 0" style="list-style-type: none; padding: 0;">
        <li v-for="p in presencas" :key="p.id" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
          <strong>Participante:</strong> {{ p.participanteId }} |
          <strong>Origem:</strong> {{ p.origem }} |
          <strong>Registrada em:</strong> {{ new Date(p.registradaEm).toLocaleString() }}
          <div v-if="p.justificativa"><strong>Justificativa:</strong> {{ p.justificativa }}</div>
        </li>
      </ul>
      <p v-else-if="!carregando">Nenhuma presença registrada ainda.</p>
    </div>

    <!-- Registro Manual -->
    <div class="registro-manual" style="border: 1px solid #ccc; padding: 15px; border-radius: 6px; background: #f9f9f9;">
      <h3>Registrar Presença Manual (Organização)</h3>
      <div style="margin-bottom: 10px;">
        <label for="participante-id-input">ID do Participante:</label>
        <input
          id="participante-id-input"
          v-model="participanteIdInput"
          type="text"
          placeholder="ex: p-carla"
          style="width: 100%; padding: 8px; margin-top: 5px;"
        />
      </div>
      <div style="margin-bottom: 10px;">
        <label for="justificativa-input">Justificativa (mínimo 10 caracteres):</label>
        <textarea
          id="justificativa-input"
          v-model="justificativaInput"
          placeholder="Motivo do registro manual..."
          style="width: 100%; padding: 8px; margin-top: 5px;"
        ></textarea>
      </div>
      <button
        id="btn-registrar-manual"
        @click="registrarManual"
        :disabled="carregandoManual || !participanteIdInput.trim() || !justificativaInput.trim()"
        style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        {{ carregandoManual ? 'Registrando...' : 'Registrar Manualmente' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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

const presencas = ref([]);
const carregando = ref(true);
const carregandoManual = ref(false);
const erro = ref('');
const sucessoMsg = ref('');

const participanteIdInput = ref('');
const justificativaInput = ref('');

async function carregarPresencas() {
  carregando.value = true;
  erro.value = '';
  try {
    const res = await fetch(`/encontros/${props.encontroId}/presencas`, {
      headers: {
        'X-Usuario': props.usuario
      }
    });
    const data = await res.json();
    if (!res.ok) {
      erro.value = data.erro || 'ERRO_DESCONHECIDO';
      carregando.value = false;
      return;
    }
    presencas.value = data;
    carregando.value = false;
  } catch (e) {
    erro.value = 'FALHA_CONEXAO';
    carregando.value = false;
  }
}

async function registrarManual() {
  erro.value = '';
  sucessoMsg.value = '';

  if (!justificativaInput.value.trim() || justificativaInput.value.trim().length < 10) {
    erro.value = 'JUSTIFICATIVA_OBRIGATORIA';
    return;
  }

  carregandoManual.value = true;
  try {
    const res = await fetch(`/encontros/${props.encontroId}/presencas/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario': props.usuario
      },
      body: JSON.stringify({
        participanteId: participanteIdInput.value.trim(),
        justificativa: justificativaInput.value.trim()
      })
    });
    const data = await res.json();
    if (!res.ok) {
      erro.value = data.erro || 'ERRO_DESCONHECIDO';
      carregandoManual.value = false;
      return;
    }

    sucessoMsg.value = `Presença manual registrada com sucesso! (ID: ${data.id})`;
    participanteIdInput.value = '';
    justificativaInput.value = '';
    carregandoManual.value = false;
    carregarPresencas();
  } catch (e) {
    erro.value = 'FALHA_CONEXAO';
    carregandoManual.value = false;
  }
}

onMounted(() => {
  carregarPresencas();
});
</script>
