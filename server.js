const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

// 의사별 체어 상태 관리
const doctors = {
  doctor1: { currentChair: '선택되지 않음', nextChairs: ['비어 있음', '비어 있음', '비어 있음'] },
  doctor2: { currentChair: '선택되지 않음', nextChairs: ['비어 있음', '비어 있음', '비어 있음'] },
  doctor3: { currentChair: '선택되지 않음', nextChairs: ['비어 있음', '비어 있음', '비어 있음'] }
};

// 모든 클라이언트에 상태를 전송하는 함수
function broadcastState() {
  const state = {
    doctors
  };
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

server.on('connection', (ws) => {
  // 새 클라이언트가 연결되면 현재 상태 전송
  ws.send(JSON.stringify({ doctors }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { doctor, action, chair } = data;

    if (action === 'selectChair') {
      // 의사별 다음 진료할 체어 목록에 새로운 체어 추가
      for (let i = 0; i < doctors[doctor].nextChairs.length; i++) {
        if (doctors[doctor].nextChairs[i] === '비어 있음') {
          doctors[doctor].nextChairs[i] = chair;
          break;
        }
      }
    } else if (action === 'endCurrentChair') {
      // 현재 진료 중인 체어를 다음 체어로 변경하고 목록 이동
      if (doctors[doctor].nextChairs[0] !== '비어 있음') {
        doctors[doctor].currentChair = doctors[doctor].nextChairs[0];
        doctors[doctor].nextChairs = [...doctors[doctor].nextChairs.slice(1), '비어 있음'];
      } else {
        doctors[doctor].currentChair = '선택되지 않음';
      }
    }

    // 업데이트된 상태를 모든 클라이언트에 전송
    broadcastState();
  });
});

console.log(`WebSocket 서버가 포트 ${port}에서 실행 중입니다.`);
