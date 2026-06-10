const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 메모리에 방 정보 저장
const rooms = {};

// 유틸리티
function generateRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function ensureUniqueRoomCode() {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms[code]);
  return code;
}

// ================================================================
// API ROUTES
// ================================================================

// 방 생성
app.post('/api/rooms', (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: '닉네임 필요' });
  }

  const roomCode = ensureUniqueRoomCode();
  const playerId = 'player_' + Date.now();
  const AVATARS = ['👤', '👨', '👩', '👶', '🧑', '👴', '👵'];

  const player = {
    id: playerId,
    name: nickname,
    avatar: AVATARS[0],
    score: 0
  };

  rooms[roomCode] = {
    code: roomCode,
    host: playerId,
    started: false,
    round: 1,
    questionIndex: 0,
    players: {
      [playerId]: player
    },
    votes: {},
    scores: {
      [playerId]: 0
    },
    createdAt: Date.now()
  };

  console.log(`✅ 방 생성: ${roomCode}, 호스트: ${nickname}`);

  res.json({
    roomCode,
    playerId,
    room: rooms[roomCode]
  });
});

// 방 입장
app.post('/api/rooms/:code/join', (req, res) => {
  const { code } = req.params;
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: '닉네임 필요' });
  }

  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: '존재하지 않는 방' });
  }

  // 닉네임 중복 확인
  if (Object.values(room.players).some(p => p.name === nickname)) {
    return res.status(400).json({ error: '이미 사용 중인 닉네임' });
  }

  const playerId = 'player_' + Date.now();
  const AVATARS = ['👤', '👨', '👩', '👶', '🧑', '👴', '👵'];
  const playerCount = Object.keys(room.players).length;

  const player = {
    id: playerId,
    name: nickname,
    avatar: AVATARS[playerCount % AVATARS.length],
    score: 0
  };

  room.players[playerId] = player;
  room.scores[playerId] = 0;

  console.log(`✅ 입장: ${code}, 플레이어: ${nickname}, 총 ${Object.keys(room.players).length}명`);

  res.json({
    playerId,
    room: room
  });
});

// 방 정보 조회
app.get('/api/rooms/:code', (req, res) => {
  const { code } = req.params;
  const room = rooms[code];

  if (!room) {
    return res.status(404).json({ error: '존재하지 않는 방' });
  }

  res.json(room);
});

// 게임 시작
app.post('/api/rooms/:code/start', (req, res) => {
  const { code } = req.params;
  const room = rooms[code];

  if (!room) {
    return res.status(404).json({ error: '존재하지 않는 방' });
  }

  room.started = true;
  room.round = 1;
  room.questionIndex = 0;
  room.votes = {};

  console.log(`🎮 게임 시작: ${code}`);

  res.json({ success: true, room });
});

// 투표
app.post('/api/rooms/:code/vote', (req, res) => {
  const { code } = req.params;
  const { playerId, targetId } = req.body;

  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: '존재하지 않는 방' });
  }

  room.votes[playerId] = targetId;

  console.log(`🗳️ 투표: ${room.players[playerId]?.name} → ${room.players[targetId]?.name}`);

  res.json({ success: true, votes: room.votes });
});

// 다음 라운드
app.post('/api/rooms/:code/next-round', (req, res) => {
  const { code } = req.params;
  const { round, questionIndex, scores } = req.body;

  const room = rooms[code];
  if (!room) {
    return res.status(404).json({ error: '존재하지 않는 방' });
  }

  room.round = round;
  room.questionIndex = questionIndex;
  room.scores = scores;
  room.votes = {};

  res.json({ success: true, room });
});

// 게임 종료 (방 삭제)
app.post('/api/rooms/:code/end', (req, res) => {
  const { code } = req.params;

  if (rooms[code]) {
    delete rooms[code];
    console.log(`🏁 게임 종료: ${code}`);
  }

  res.json({ success: true });
});

// 모든 방 조회 (디버그용)
app.get('/api/rooms', (req, res) => {
  const roomList = Object.values(rooms).map(room => ({
    code: room.code,
    playerCount: Object.keys(room.players).length,
    started: room.started,
    createdAt: new Date(room.createdAt).toLocaleString()
  }));

  res.json(roomList);
});

// 서버 정보 조회 (네트워크 IP, 포트 등)
app.get('/api/server-info', (req, res) => {
  const os = require('os');
  const localIP = os.networkInterfaces();
  let ipAddress = 'localhost';

  for (const iface of Object.values(localIP)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ipAddress = addr.address;
        break;
      }
    }
  }

  res.json({
    host: req.get('host'),
    ip: ipAddress,
    port: PORT,
    url: `http://${ipAddress}:${PORT}`
  });
});

// ================================================================
// SERVER START
// ================================================================

app.listen(PORT, '0.0.0.0', () => {
  const localIP = require('os').networkInterfaces();
  let ipAddress = 'localhost';

  for (const iface of Object.values(localIP)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ipAddress = addr.address;
        break;
      }
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('🎮 합법적 앞담화 서버 시작!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\n📍 로컬: http://localhost:${PORT}`);
  console.log(`📍 네트워크: http://${ipAddress}:${PORT}`);
  console.log('\n💡 같은 Wi-Fi에 연결된 다른 기기에서도 접속 가능합니다!');
  console.log('\n═══════════════════════════════════════════════════\n');
});

// 안전한 종료
process.on('SIGINT', () => {
  console.log('\n\n서버 종료 중...');
  process.exit(0);
});
