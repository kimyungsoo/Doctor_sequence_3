const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let currentChair = '선택되지 않음';
let nextChairs = ['비어 있음', '비어 있음', '비어 있음'];

function broadcastState() {
  const state = {
    currentChair,
    nextChairs,
  };
  // 연결된 모든 클라이언트에게 현재 상태 전송
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

server.on('connection', (ws) => {
  // 새 클라이언트가 연결되면 현재 상태를 전송
  ws.send(JSON.stringify({ currentChair, nextChairs }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.action === 'selectChair') {
      // 다음 진료할 체어 목록에 새로운 체어 추가
      for (let i = 0; i < nextChairs.length; i++) {
        if (nextChairs[i] === '비어 있음') {
          nextChairs[i] = data.chair;
          break;
        }
      }
    } else if (data.action === 'endCurrentChair') {
      // 현재 진료 중인 체어를 다음 체어로 바꾸고, 목록 이동
      if (nextChairs[0] !== '비어 있음') {
        currentChair = nextChairs[0];
        nextChairs = [...nextChairs.slice(1), '비어 있음'];
      } else {
        currentChair = '선택되지 않음';
      }
    }

    // 업데이트된 상태를 모든 클라이언트에게 전송
    broadcastState();
  });
});

console.log(`WebSocket 서버가 포트 ${port}에서 실행 중입니다.`);
