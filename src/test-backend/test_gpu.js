import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "10s",
};

export default function () {
  // Dán mã accessToken lấy từ trình duyệt vào đây
  const myToken =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc3MzAyNzE3MywiZXhwIjoxNzczMDMwNzczfQ.eId2TLWVVT4Gt-zwiScS4ObsrzljA4cORo_JvySmaU0";

  const params = {
    headers: {
      // Gửi đúng tên Cookie là accessToken như trong code Java của bạn
      Cookie: `accessToken=${myToken}`,
      "Content-Type": "application/json",
    },
  };

  const url = "http://localhost:8080/ai/test?prompt=Phan+tich+diem";
  const res = http.get(url, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
