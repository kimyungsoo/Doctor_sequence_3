// server.js
const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });

let currentChair = '선택되지 않음';

server.on('connection', (ws) => {
  console.log('클라이언트가 연결되었습니다.');

  // 클라이언트에게 현재 상태를 전송
  ws.send(JSON.stringify({ chair: currentChair }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    currentChair = data.chair;

    // 모든 클라이언트에게 새로운 상태를 전송
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ chair: currentChair }));
      }
    });
  });

  ws.on('close', () => {
    console.log('클라이언트가 연결을 종료했습니다.');
  });
});

console.log(`WebSocket 서버가 포트 ${port}에서 실행 중입니다.`);
