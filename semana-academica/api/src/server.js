import express from 'express';
import { DatabaseSync } from 'node:sqlite';

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
  `);

  function popularDadosIniciais() {
    db.exec('DELETE FROM usuarios');
    db.exec('DELETE FROM salas');
    db.exec('DELETE FROM atividades');
    db.exec('DELETE FROM encontros');
    db.exec('DELETE FROM sistema');

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

    return {
      id: row.id,
      titulo: row.titulo,
      tipo: row.tipo,
      salaId: row.salaId,
      vagas: row.vagas,
      encontros,
      cargaHorariaMinutos,
      situacao,
      ocupadas: 0,
      vagasRestantes: row.vagas,
      emEspera: 0
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

  // GET /atividades/:id
  app.get('/atividades/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM atividades WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ erro: 'NAO_ENCONTRADO', mensagem: 'Atividade não encontrada' });
    }
    res.json(getAtividadeObj(row));
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
