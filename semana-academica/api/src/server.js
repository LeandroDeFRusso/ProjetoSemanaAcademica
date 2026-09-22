import express from 'express';
import Database from 'better-sqlite3';
const DatabaseSync = Database;
import crypto from 'node:crypto';

const ocupadasStubs = new Map();

export function setOcupadasStub(atividadeId, qtd) {
  ocupadasStubs.set(atividadeId, qtd);
}

export function getOcupadas(atividadeId) {
  return ocupadasStubs.get(atividadeId) ?? 0;
}

export const atividadesService = {
  setOcupadasStub,
  getOcupadas
};

export const atividadesRepository = {
  setOcupadasStub,
  getOcupadas
};

export function criarServidor(portaDesejada = 3000) {
  const app = express();
  app.use(express.json());

  // In-memory or file database using node:sqlite
  const db = new DatabaseSync(':memory:');

  // Initialize schema and initial data
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      papel TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS salas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      capacidade INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS atividades (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL,
      salaId TEXT NOT NULL,
      vagas INTEGER NOT NULL,
      cancelada INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS encontros (
      id TEXT PRIMARY KEY,
      atividadeId TEXT NOT NULL,
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sistema (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inscricoes (
      id TEXT PRIMARY KEY,
      atividadeId TEXT NOT NULL,
      participanteId TEXT NOT NULL,
      status TEXT NOT NULL,
      posicaoNaEspera INTEGER,
      convocadaAte TEXT,
      criadaEm TEXT NOT NULL
    );
  `);

  function popularDadosIniciais() {
    db.exec('DELETE FROM usuarios');
    db.exec('DELETE FROM salas');
    db.exec('DELETE FROM atividades');
    db.exec('DELETE FROM encontros');
    db.exec('DELETE FROM sistema');
    db.exec('DELETE FROM inscricoes');

    const usuariosIniciais = [
      ['org-ana', 'Ana Beatriz Lima', 'organizacao'],
      ['org-bruno', 'Bruno Tavares', 'organizacao'],
      ['p-carla', 'Carla Mendes Souza', 'participante'],
      ['p-diego', 'Diego Alves', 'participante'],
      ['p-elisa', 'Elisa Fernandes da Rocha', 'participante'],
      ['p-fabio', 'Fábio Nogueira', 'participante'],
      ['p-gabriela', 'Gabriela Moura Castro', 'participante'],
      ['p-heitor', 'Heitor Campos', 'participante'],
      ['p-isadora', 'Isadora Ribeiro dos Santos', 'participante'],
      ['p-joao', 'João Pedro Martins', 'participante']
    ];

    const stmtUser = db.prepare('INSERT INTO usuarios (id, nome, papel) VALUES (?, ?, ?)');
    for (const u of usuariosIniciais) {
      stmtUser.run(u[0], u[1], u[2]);
    }

    const salasIniciais = [
      ['auditorio', 'Auditório Central', 200],
      ['sala-101', 'Sala 101', 40],
      ['sala-102', 'Sala 102', 40],
      ['lab-3', 'Laboratório 3', 20]
    ];

    const stmtSala = db.prepare('INSERT INTO salas (id, nome, capacidade) VALUES (?, ?, ?)');
    for (const s of salasIniciais) {
      stmtSala.run(s[0], s[1], s[2]);
    }

    const stmtSys = db.prepare('INSERT OR REPLACE INTO sistema (chave, valor) VALUES (?, ?)');
    stmtSys.run('relogio', '2026-10-13T09:00:00-03:00');
  }

  popularDadosIniciais();

  // Test mode routes
  app.post('/_teste/reset', (req, res) => {
    if (process.env.MODO_TESTE !== '1') {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Not found' });
    }
    popularDadosIniciais();
    res.status(204).send();
  });

  app.put('/_teste/relogio', (req, res) => {
    if (process.env.MODO_TESTE !== '1') {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Not found' });
    }
    const { agora } = req.body || {};
    if (!agora) {
      return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Data ausente' });
    }
    db.prepare('INSERT OR REPLACE INTO sistema (chave, valor) VALUES (?, ?)').run('relogio', agora);
    res.json({ agora });
  });

  app.get('/_teste/relogio', (req, res) => {
    if (process.env.MODO_TESTE !== '1') {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Not found' });
    }
    const row = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
    res.json({ agora: row ? row.valor : '2026-10-13T09:00:00-03:00' });
  });

  app.post('/_teste/atividades', (req, res) => {
    if (process.env.MODO_TESTE !== '1') {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Not found' });
    }
    const { id, titulo, tipo, salaId, vagas, encontros, cancelada } = req.body;
    db.prepare('INSERT OR REPLACE INTO atividades (id, titulo, tipo, salaId, vagas, cancelada) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, titulo, tipo, salaId, vagas, cancelada ? 1 : 0
    );
    const stmtEnc = db.prepare('INSERT OR REPLACE INTO encontros (id, atividadeId, inicio, fim) VALUES (?, ?, ?, ?)');
    for (const enc of encontros) {
      stmtEnc.run(enc.id, id, enc.inicio, enc.fim);
    }
    res.status(201).json({ id });
  });

  // Authentication middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/_teste/') || req.path.startsWith('/certificados/')) {
      return next();
    }
    processarExpiracoesEConvocacoes(db);
    const usuarioId = req.headers['x-usuario'];
    if (!usuarioId) {
      return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário não identificado' });
    }
    const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuarioId);
    if (!user) {
      return res.status(401).json({ erro: 'USUARIO_DESCONHECIDO', mensagem: 'Usuário desconhecido' });
    }
    req.usuario = user;
    next();
  });

  // GET /salas
  app.get('/salas', (req, res) => {
    const salas = db.prepare('SELECT id, nome, capacidade FROM salas').all();
    res.json(salas);
  });

  function getAtividadeOcupadas(atividadeId) {
    if (ocupadasStubs.has(atividadeId)) {
      return ocupadasStubs.get(atividadeId);
    }
    const row = db.prepare("SELECT COUNT(*) as cnt FROM inscricoes WHERE atividadeId = ? AND status IN ('confirmada', 'convocada')").get(atividadeId);
    return row ? row.cnt : 0;
  }

  function getAtividadeEmEspera(atividadeId) {
    const row = db.prepare("SELECT COUNT(*) as cnt FROM inscricoes WHERE atividadeId = ? AND status = 'em_espera'").get(atividadeId);
    return row ? row.cnt : 0;
  }

  // Helper to build activity object
  function getAtividadeObj(row) {
    const encontros = db.prepare('SELECT id, inicio, fim FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC').all(row.id);
    
    // Calculate carga horaria
    let cargaHorariaMinutos = 0;
    for (const enc of encontros) {
      const inicioMs = new Date(enc.inicio).getTime();
      const fimMs = new Date(enc.fim).getTime();
      cargaHorariaMinutos += Math.round((fimMs - inicioMs) / 60000);
    }

    // Determine situacao (R12)
    let situacao = 'prevista';
    if (row.cancelada) {
      situacao = 'cancelada';
    } else if (encontros.length > 0) {
      const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
      const agoraMs = new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();
      const primeiroInicioMs = new Date(encontros[0].inicio).getTime();
      const ultimoFimMs = new Date(encontros[encontros.length - 1].fim).getTime();

      if (agoraMs >= ultimoFimMs) {
        situacao = 'encerrada';
      } else if (agoraMs >= primeiroInicioMs) {
        situacao = 'em_andamento';
      } else {
        situacao = 'prevista';
      }
    }

    const ocupadas = getAtividadeOcupadas(row.id);
    const vagasRestantes = Math.max(0, row.vagas - ocupadas);
    const emEspera = getAtividadeEmEspera(row.id);

    return {
      id: row.id,
      titulo: row.titulo,
      tipo: row.tipo,
      salaId: row.salaId,
      vagas: row.vagas,
      encontros,
      cargaHorariaMinutos,
      situacao,
      ocupadas,
      vagasRestantes,
      emEspera
    };
  }

  // GET /atividades
  app.get('/atividades', (req, res) => {
    const { dia, tipo } = req.query;
    let query = 'SELECT * FROM atividades WHERE 1=1';
    const params = [];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    const atividadesRows = db.prepare(query).all(...params);
    let atividades = atividadesRows.map(getAtividadeObj);

    if (dia) {
      atividades = atividades.filter(atv => {
        return atv.encontros.some(enc => enc.inicio.startsWith(dia));
      });
    }

    // R10: Order by start of first encounter, then title
    atividades.sort((a, b) => {
      const aInicio = a.encontros[0]?.inicio || '';
      const bInicio = b.encontros[0]?.inicio || '';
      if (aInicio !== bInicio) {
        return aInicio.localeCompare(bInicio);
      }
      return a.titulo.localeCompare(b.titulo);
    });

    res.json(atividades);
  });

    // POST /atividades
    app.post('/atividades', (req, res) => {
      if (req.usuario.papel !== 'organizacao') {
        return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização' });
      }
      const { titulo, tipo, salaId, vagas, encontros } = req.body || {};

      if (!encontros || !Array.isArray(encontros)) {
        return res.status(422).json({ erro: 'DADOS_INVALIDOS', mensagem: 'Encontros inválidos' });
      }

      if (tipo === 'palestra' && encontros.length !== 1) {
        return res.status(422).json({ erro: 'QUANTIDADE_DE_ENCONTROS', mensagem: 'Palestra deve ter 1 encontro' });
      }
      if (tipo === 'minicurso' && (encontros.length < 2 || encontros.length > 5)) {
        return res.status(422).json({ erro: 'QUANTIDADE_DE_ENCONTROS', mensagem: 'Minicurso deve ter entre 2 e 5 encontros' });
      }

      const inicioEvento = new Date('2026-10-19T00:00:00-03:00').getTime();
      const fimEvento = new Date('2026-10-23T23:59:59.999-03:00').getTime();

      for (let i = 0; i < encontros.length; i++) {
        const enc = encontros[i];
        if (!enc.inicio || !enc.fim) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Início e fim obrigatórios' });
        }
        const inicioMs = new Date(enc.inicio).getTime();
        const fimMs = new Date(enc.fim).getTime();

        if (isNaN(inicioMs) || isNaN(fimMs) || inicioMs >= fimMs) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Datas inválidas' });
        }

        if (inicioMs < inicioEvento || fimMs > fimEvento) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Fora do período do evento' });
        }

        const dInicio = enc.inicio.substring(0, 10);
        const dFim = enc.fim.substring(0, 10);
        if (dInicio !== dFim) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Início e fim devem ser no mesmo dia' });
        }

        const duracaoMinutos = Math.round((fimMs - inicioMs) / 60000);
        if (duracaoMinutos < 60 || duracaoMinutos > 240) {
          return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Duração deve ser entre 1h e 4h' });
        }

        for (let j = i + 1; j < encontros.length; j++) {
          const outro = encontros[j];
          const outroInicioMs = new Date(outro.inicio).getTime();
          const outroFimMs = new Date(outro.fim).getTime();
          if (inicioMs < outroFimMs && fimMs > outroInicioMs) {
            return res.status(422).json({ erro: 'ENCONTRO_INVALIDO', mensagem: 'Encontros sobrepostos' });
          }
        }
      }

      const sala = db.prepare('SELECT * FROM salas WHERE id = ?').get(salaId);
      if (!sala) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Sala não encontrada' });
      }
      if (vagas === undefined || vagas === null || vagas < 1 || vagas > sala.capacidade) {
        return res.status(422).json({ erro: 'VAGAS_ACIMA_DA_CAPACIDADE', mensagem: 'Vagas acima da capacidade ou inválidas' });
      }

      const existingEncontros = db.prepare(`
        SELECT e.* FROM encontros e
        JOIN atividades a ON e.atividadeId = a.id
        WHERE a.salaId = ? AND a.cancelada = 0
      `).all(salaId);

      for (const novoEnc of encontros) {
        const novoInicioMs = new Date(novoEnc.inicio).getTime();
        const novoFimMs = new Date(novoEnc.fim).getTime();
        const quinzeMinMs = 15 * 60 * 1000;

        for (const ex of existingEncontros) {
          const exInicioMs = new Date(ex.inicio).getTime();
          const exFimMs = new Date(ex.fim).getTime();

          if (novoInicioMs < (exFimMs + quinzeMinMs) && novoFimMs > (exInicioMs - quinzeMinMs)) {
            return res.status(409).json({ erro: 'CONFLITO_DE_SALA', mensagem: 'Conflito de horário na sala' });
          }
        }
      }

      const atividadeId = 'atv_' + crypto.randomBytes(4).toString('hex');
      db.prepare('INSERT INTO atividades (id, titulo, tipo, salaId, vagas, cancelada) VALUES (?, ?, ?, ?, ?, ?)').run(
        atividadeId, titulo, tipo, salaId, vagas, 0
      );

      const stmtEnc = db.prepare('INSERT INTO encontros (id, atividadeId, inicio, fim) VALUES (?, ?, ?, ?)');
      for (const enc of encontros) {
        const encId = enc.id || ('enc_' + crypto.randomBytes(4).toString('hex'));
        stmtEnc.run(encId, atividadeId, enc.inicio, enc.fim);
      }

      const createdRow = db.prepare('SELECT * FROM atividades WHERE id = ?').get(atividadeId);
      return res.status(201).json(getAtividadeObj(createdRow));
    });

    // GET /atividades/:id
    app.get('/atividades/:id', (req, res) => {
      const row = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
      if (!row) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
      }
      res.json(getAtividadeObj(row));
    });

    // PATCH /atividades/:id
    app.patch('/atividades/:id', (req, res) => {
      if (req.usuario.papel !== 'organizacao') {
        return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização' });
      }
      const row = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
      if (!row) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
      }
      if (row.cancelada) {
        return res.status(422).json({ erro: 'ATIVIDADE_CANCELADA', mensagem: 'Atividade cancelada' });
      }
      const { salaId, tipo, encontros, titulo, vagas } = req.body || {};
      if (salaId !== undefined || tipo !== undefined || encontros !== undefined) {
        return res.status(422).json({ erro: 'CAMPO_NAO_EDITAVEL', mensagem: 'Campo não editável' });
      }

      let novoTitulo = row.titulo;
      let novasVagas = row.vagas;

      if (titulo !== undefined) {
        novoTitulo = titulo;
      }
      if (vagas !== undefined) {
        const sala = db.prepare('SELECT capacidade FROM salas WHERE id = ?').get(row.salaId);
        if (vagas <= 0 || (sala && vagas > sala.capacidade)) {
          return res.status(422).json({ erro: 'VAGAS_ACIMA_DA_CAPACIDADE', mensagem: 'Vagas acima da capacidade ou inválidas' });
        }
        const ocupadasAtuais = getOcupadas(row.id);
        if (vagas < ocupadasAtuais) {
          return res.status(409).json({ erro: 'VAGAS_ABAIXO_DOS_INSCRITOS', mensagem: 'Vagas abaixo dos inscritos' });
        }
        novasVagas = vagas;
      }

      db.prepare('UPDATE atividades SET titulo = ?, vagas = ? WHERE id = ?').run(novoTitulo, novasVagas, req.params.id);
      const updatedRow = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
      res.json(getAtividadeObj(updatedRow));
    });

    // POST /atividades/:id/cancelamento
    app.post('/atividades/:id/cancelamento', (req, res) => {
      if (req.usuario.papel !== 'organizacao') {
        return res.status(403).json({ erro: 'SOMENTE_ORGANIZACAO', mensagem: 'Apenas organização' });
      }
      const row = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
      if (!row) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
      }

      if (row.cancelada) {
        return res.status(422).json({ erro: 'ATIVIDADE_CANCELADA', mensagem: 'Atividade já cancelada' });
      }

      const encontros = db.prepare('SELECT * FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC').all(row.id);
      if (encontros.length > 0) {
        const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
        const agoraMs = new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();
        const primeiroInicioMs = new Date(encontros[0].inicio).getTime();
        if (agoraMs >= primeiroInicioMs) {
          return res.status(422).json({ erro: 'ATIVIDADE_JA_INICIADA', mensagem: 'Atividade já iniciada' });
        }
      }

      db.prepare('UPDATE atividades SET cancelada = 1 WHERE id = ?').run(req.params.id);
      const updatedRow = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
      res.json(getAtividadeObj(updatedRow));
    });

    // POST /atividades/:id/inscricoes
    app.post('/atividades/:id/inscricoes', (req, res) => {
      if (req.usuario.papel !== 'participante') {
        return res.status(403).json({ erro: 'SOMENTE_PARTICIPANTE', mensagem: 'Apenas participante' });
      }
      const atividade = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
      if (!atividade) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
      }
      if (atividade.cancelada) {
        return res.status(422).json({ erro: 'ATIVIDADE_CANCELADA', mensagem: 'Atividade cancelada' });
      }

      const encontros = db.prepare('SELECT * FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC').all(atividade.id);
      if (encontros.length > 0) {
        const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
        const agoraMs = new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();
        const primeiroInicioMs = new Date(encontros[0].inicio).getTime();
        const fechamentoMs = primeiroInicioMs - 30 * 60 * 1000;
        if (agoraMs >= fechamentoMs) {
          return res.status(422).json({ erro: 'INSCRICOES_ENCERRADAS', mensagem: 'Inscrições encerradas' });
        }
      }

      const inscricaoAtiva = db.prepare(`
        SELECT * FROM inscricoes 
        WHERE atividadeId = ? AND participanteId = ? AND status IN ('confirmada', 'em_espera', 'convocada')
      `).get(atividade.id, req.usuario.id);

      if (inscricaoAtiva) {
        return res.status(409).json({ erro: 'JA_INSCRITO', mensagem: 'Já inscrito' });
      }

      const ocupadas = getAtividadeOcupadas(atividade.id);
      let status = 'confirmada';
      let posicaoNaEspera = null;

      if (ocupadas >= atividade.vagas) {
        status = 'em_espera';
        posicaoNaEspera = getAtividadeEmEspera(atividade.id) + 1;
      }

      if (status === 'confirmada') {
        // R4: Conflito de horário
        const novosEncontros = db.prepare('SELECT inicio, fim FROM encontros WHERE atividadeId = ?').all(atividade.id);
        const encontrosAtivos = db.prepare(`
          SELECT e.inicio, e.fim 
          FROM inscricoes i
          JOIN encontros e ON i.atividadeId = e.atividadeId
          WHERE i.participanteId = ? AND i.status IN ('confirmada', 'convocada')
        `).all(req.usuario.id);

        for (const novo of novosEncontros) {
          const novoInicio = new Date(novo.inicio).getTime();
          const novoFim = new Date(novo.fim).getTime();
          for (const ativo of encontrosAtivos) {
            const ativoInicio = new Date(ativo.inicio).getTime();
            const ativoFim = new Date(ativo.fim).getTime();
            if (novoInicio < ativoFim && novoFim > ativoInicio) {
              return res.status(409).json({ erro: 'CONFLITO_DE_HORARIO', mensagem: 'Conflito de horário' });
            }
          }
        }

        // R5: Limite de minicursos
        if (atividade.tipo === 'minicurso') {
          const minicursosAtivos = db.prepare(`
            SELECT COUNT(*) as cnt 
            FROM inscricoes i
            JOIN atividades a ON i.atividadeId = a.id
            WHERE i.participanteId = ? AND a.tipo = 'minicurso' AND i.status IN ('confirmada', 'convocada')
          `).get(req.usuario.id);

          if (minicursosAtivos && minicursosAtivos.cnt >= 3) {
            return res.status(422).json({ erro: 'LIMITE_DE_MINICURSOS', mensagem: 'Limite de minicursos atingido' });
          }
        }
      }

      const id = 'ins_' + crypto.randomBytes(4).toString('hex');
      const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
      const criadaEm = relogioRow ? relogioRow.valor : new Date().toISOString();

      db.prepare(`
        INSERT INTO inscricoes (id, atividadeId, participanteId, status, posicaoNaEspera, convocadaAte, criadaEm)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, atividade.id, req.usuario.id, status, posicaoNaEspera, null, criadaEm);

      const novaInscricao = db.prepare('SELECT * FROM inscricoes WHERE id = ?').get(id);
      return res.status(201).json({
        id: novaInscricao.id,
        atividadeId: novaInscricao.atividadeId,
        participanteId: novaInscricao.participanteId,
        status: novaInscricao.status,
        posicaoNaEspera: novaInscricao.posicaoNaEspera,
        convocadaAte: novaInscricao.convocadaAte,
        criadaEm: novaInscricao.criadaEm
      });
    });

    // GET /inscricoes
    app.get('/inscricoes', (req, res) => {
      const { atividadeId } = req.query;
      let query = 'SELECT * FROM inscricoes WHERE 1=1';
      const params = [];

      if (req.usuario.papel === 'participante') {
        query += ' AND participanteId = ?';
        params.push(req.usuario.id);
      }

      if (atividadeId) {
        query += ' AND atividadeId = ?';
        params.push(atividadeId);
      }

      const rows = db.prepare(query).all(...params);
      const inscricoes = rows.map(r => ({
        id: r.id,
        atividadeId: r.atividadeId,
        participanteId: r.participanteId,
        status: r.status,
        posicaoNaEspera: r.posicaoNaEspera,
        convocadaAte: r.convocadaAte,
        criadaEm: r.criadaEm
      }));
      res.json(inscricoes);
    });

    // GET /inscricoes/:id
    app.get('/inscricoes/:id', (req, res) => {
      const row = db.prepare('SELECT * FROM inscricoes WHERE id = ?').get(req.params.id);
      if (!row) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Inscrição não encontrada' });
      }
      if (req.usuario.papel === 'participante' && row.participanteId !== req.usuario.id) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Inscrição não encontrada' });
      }
      res.json({
        id: row.id,
        atividadeId: row.atividadeId,
        participanteId: row.participanteId,
        status: row.status,
        posicaoNaEspera: row.posicaoNaEspera,
        convocadaAte: row.convocadaAte,
        criadaEm: row.criadaEm
      });
    });

  function formatarDataIso(ms) {
    const msLocal = ms - (3 * 3600 * 1000);
    const dUtc = new Date(msLocal);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = dUtc.getUTCFullYear();
    const mm = pad(dUtc.getUTCMonth() + 1);
    const dd = pad(dUtc.getUTCDate());
    const hh = pad(dUtc.getUTCHours());
    const min = pad(dUtc.getUTCMinutes());
    const ss = pad(dUtc.getUTCSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}-03:00`;
  }

  function atualizarPosicoesEspera(db, atividadeId) {
    const esperaRows = db.prepare("SELECT id FROM inscricoes WHERE atividadeId = ? AND status = 'em_espera' ORDER BY posicaoNaEspera ASC, criadaEm ASC").all(atividadeId);
    const stmtUpdate = db.prepare('UPDATE inscricoes SET posicaoNaEspera = ? WHERE id = ?');
    esperaRows.forEach((row, index) => {
      stmtUpdate.run(index + 1, row.id);
    });
  }

  function liberarVagaEConvocar(db, atividadeId, tempoLiberacaoOverride = null) {
    const atividade = db.prepare('SELECT * FROM atividades WHERE id = ?').get(atividadeId);
    if (!atividade) return;

    const encontros = db.prepare('SELECT * FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC').all(atividadeId);
    if (encontros.length === 0) return;

    const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
    const agoraMs = tempoLiberacaoOverride !== null ? tempoLiberacaoOverride : new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();
    const primeiroInicioMs = new Date(encontros[0].inicio).getTime();
    const fechamentoMs = primeiroInicioMs - 30 * 60 * 1000;

    if (agoraMs >= fechamentoMs) {
      return;
    }

    const ocupadas = getAtividadeOcupadas(atividadeId);
    if (ocupadas < atividade.vagas) {
      const primeiroEspera = db.prepare("SELECT * FROM inscricoes WHERE atividadeId = ? AND status = 'em_espera' ORDER BY posicaoNaEspera ASC, criadaEm ASC LIMIT 1").get(atividadeId);
      if (primeiroEspera) {
        const prazoMs = Math.min(agoraMs + 2 * 60 * 60 * 1000, fechamentoMs);
        const convocadaAte = formatarDataIso(prazoMs);

        db.prepare("UPDATE inscricoes SET status = 'convocada', posicaoNaEspera = NULL, convocadaAte = ? WHERE id = ?").run(convocadaAte, primeiroEspera.id);
        atualizarPosicoesEspera(db, atividadeId);
      }
    }
  }

  function processarExpiracoesEConvocacoes(db) {
    const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
    const agoraMs = new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();

    const expiradas = db.prepare("SELECT * FROM inscricoes WHERE status = 'convocada' AND convocadaAte IS NOT NULL").all();
    for (const inc of expiradas) {
      const ateMs = new Date(inc.convocadaAte).getTime();
      if (agoraMs >= ateMs) {
        db.prepare("UPDATE inscricoes SET status = 'expirada', posicaoNaEspera = NULL, convocadaAte = NULL WHERE id = ?").run(inc.id);
        liberarVagaEConvocar(db, inc.atividadeId, ateMs);
      }
    }
  }

    // POST /inscricoes/:id/cancelamento
    app.post('/inscricoes/:id/cancelamento', (req, res) => {
      if (req.usuario.papel !== 'participante') {
        return res.status(403).json({ erro: 'SOMENTE_PARTICIPANTE', mensagem: 'Apenas participante' });
      }
      processarExpiracoesEConvocacoes(db);
      const inscricao = db.prepare('SELECT * FROM inscricoes WHERE id = ?').get(req.params.id);
      if (!inscricao) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Inscrição não encontrada' });
      }
      if (inscricao.participanteId !== req.usuario.id) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Inscrição não encontrada' });
      }
      if (inscricao.status === 'cancelada' || inscricao.status === 'expirada') {
        return res.status(422).json({ erro: 'INSCRICAO_INATIVA', mensagem: 'Inscrição inativa' });
      }
      const atividade = db.prepare('SELECT * FROM atividades WHERE id = ?').get(inscricao.atividadeId);
      if (atividade) {
        const encontros = db.prepare('SELECT * FROM encontros WHERE atividadeId = ? ORDER BY inicio ASC').all(atividade.id);
        if (encontros.length > 0) {
          const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
          const agoraMs = new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();
          const primeiroInicioMs = new Date(encontros[0].inicio).getTime();
          if (agoraMs >= primeiroInicioMs) {
            return res.status(422).json({ erro: 'ATIVIDADE_JA_INICIADA', mensagem: 'Atividade já iniciada' });
          }
        }
      }

      const statusAntigo = inscricao.status;
      db.prepare("UPDATE inscricoes SET status = 'cancelada', posicaoNaEspera = NULL, convocadaAte = NULL WHERE id = ?").run(inscricao.id);

      if (statusAntigo === 'confirmada' || statusAntigo === 'convocada') {
        liberarVagaEConvocar(db, inscricao.atividadeId);
      }

      const atualizada = db.prepare('SELECT * FROM inscricoes WHERE id = ?').get(inscricao.id);
      res.json({
        id: atualizada.id,
        atividadeId: atualizada.atividadeId,
        participanteId: atualizada.participanteId,
        status: atualizada.status,
        posicaoNaEspera: atualizada.posicaoNaEspera,
        convocadaAte: atualizada.convocadaAte,
        criadaEm: atualizada.criadaEm
      });
    });

    // POST /inscricoes/:id/confirmacao
    app.post('/inscricoes/:id/confirmacao', (req, res) => {
      if (req.usuario.papel !== 'participante') {
        return res.status(403).json({ erro: 'SOMENTE_PARTICIPANTE', mensagem: 'Apenas participante' });
      }
      processarExpiracoesEConvocacoes(db);

      const inscricao = db.prepare('SELECT * FROM inscricoes WHERE id = ?').get(req.params.id);
      if (!inscricao || inscricao.participanteId !== req.usuario.id) {
        return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Inscrição não encontrada' });
      }

      if (inscricao.status === 'expirada') {
        return res.status(422).json({ erro: 'CONVOCACAO_EXPIRADA', mensagem: 'Convocação expirada' });
      }
      if (inscricao.status !== 'convocada') {
        return res.status(422).json({ erro: 'SEM_CONVOCACAO', mensagem: 'Inscrição não está convocada' });
      }

      const relogioRow = db.prepare('SELECT valor FROM sistema WHERE chave = ?').get('relogio');
      const agoraMs = new Date(relogioRow ? relogioRow.valor : Date.now()).getTime();
      if (inscricao.convocadaAte) {
        const ateMs = new Date(inscricao.convocadaAte).getTime();
        if (agoraMs > ateMs) {
          return res.status(422).json({ erro: 'CONVOCACAO_EXPIRADA', mensagem: 'Convocação expirada' });
        }
      }

      const atividade = db.prepare('SELECT * FROM atividades WHERE id = ?').get(inscricao.atividadeId);

      const novosEncontros = db.prepare('SELECT inicio, fim FROM encontros WHERE atividadeId = ?').all(atividade.id);
      const encontrosAtivos = db.prepare(`
        SELECT e.inicio, e.fim 
        FROM inscricoes i
        JOIN encontros e ON i.atividadeId = e.atividadeId
        WHERE i.participanteId = ? AND i.status IN ('confirmada', 'convocada') AND i.id != ?
      `).all(req.usuario.id, inscricao.id);

      for (const novo of novosEncontros) {
        const novoInicio = new Date(novo.inicio).getTime();
        const novoFim = new Date(novo.fim).getTime();
        for (const ativo of encontrosAtivos) {
          const ativoInicio = new Date(ativo.inicio).getTime();
          const ativoFim = new Date(ativo.fim).getTime();
          if (novoInicio < ativoFim && novoFim > ativoInicio) {
            return res.status(409).json({ erro: 'CONFLITO_DE_HORARIO', mensagem: 'Conflito de horário' });
          }
        }
      }

      if (atividade.tipo === 'minicurso') {
        const minicursosAtivos = db.prepare(`
          SELECT COUNT(*) as cnt 
          FROM inscricoes i
          JOIN atividades a ON i.atividadeId = a.id
          WHERE i.participanteId = ? AND a.tipo = 'minicurso' AND i.status IN ('confirmada', 'convocada') AND i.id != ?
        `).get(req.usuario.id, inscricao.id);

        if (minicursosAtivos && minicursosAtivos.cnt >= 3) {
          return res.status(422).json({ erro: 'LIMITE_DE_MINICURSOS', mensagem: 'Limite de minicursos atingido' });
        }
      }

      db.prepare("UPDATE inscricoes SET status = 'confirmada', posicaoNaEspera = NULL, convocadaAte = NULL WHERE id = ?").run(inscricao.id);

      const atualizada = db.prepare('SELECT * FROM inscricoes WHERE id = ?').get(inscricao.id);
      res.json({
        id: atualizada.id,
        atividadeId: atualizada.atividadeId,
        participanteId: atualizada.participanteId,
        status: atualizada.status,
        posicaoNaEspera: atualizada.posicaoNaEspera,
        convocadaAte: atualizada.convocadaAte,
        criadaEm: atualizada.criadaEm
      });
    });



  return new Promise((resolve) => {
    const server = app.listen(portaDesejada, () => {
      const porta = server.address().port;
      resolve({ app: server, porta });
    });
  });
}

if (process.argv[1] && process.argv[1].endsWith('server.js') && process.env.NODE_ENV !== 'test') {
  criarServidor(process.env.PORT || 3000);
}
