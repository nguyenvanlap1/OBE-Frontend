import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "10s",
};

export default function () {
  const url = "http://localhost:11434/api/chat";

  const payload = JSON.stringify({
    model: "qwen2.5:1.5b", // Thêm dòng này vào
    messages: [
      {
        role: "user",
        content:
          "Giải thích ngắn gọn khái niệm OBE (Outcome-Based Education) là gì và tại sao nó quan trọng trong giáo dục đại học?",
      },
    ],
    stream: false,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  const body = JSON.parse(res.body);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has response text": () => body.message.content.length > 0,
  });

  console.log(`Ollama response time: ${res.timings.duration / 1000}s`);

  sleep(1);
}
