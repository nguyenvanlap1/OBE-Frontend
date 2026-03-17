// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (obj: any, label: string = "DATA") => {
  let target = obj;

  // Đệ quy tìm sâu vào bên trong nếu gặp các thuộc tính bọc như 'data'
  // Xử lý cả trường hợp axios response hoặc ApiResponse bọc nhau
  while (
    target &&
    typeof target === "object" &&
    "data" in target &&
    !Array.isArray(target.data)
  ) {
    target = target.data;
  }

  // Nếu tầng cuối cùng vẫn là { data: [...] } (thường là PageResponse)
  const finalOutput = target && target.data ? target.data : target;

  console.log(
    `%c === DEBUG: ${label} === `,
    "background: #222; color: #bada55; font-weight: bold;",
  );

  // Dùng table nếu là mảng cho dễ nhìn, dùng dir nếu là object sâu
  if (Array.isArray(finalOutput)) {
    console.table(finalOutput);
  } else {
    console.dir(finalOutput, { depth: null });
  }
};
