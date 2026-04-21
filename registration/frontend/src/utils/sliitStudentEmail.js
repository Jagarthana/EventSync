/** Must stay in sync with backend/utils/sliitStudentEmail.js */
export const STUDENT_EMAIL_HINT =
  "Use your SLIIT student email: IT or BM followed by exactly 8 letters or numbers, then @my.sliit.lk (e.g. it12345678@my.sliit.lk). The IT/BM prefix is not case-sensitive.";

const STUDENT_EMAIL_RE = /^((it|bm)[a-z0-9]{8})@my\.sliit\.lk$/;

export function isValidSliitStudentEmail(email) {
  const n = String(email || "").trim().toLowerCase();
  return STUDENT_EMAIL_RE.test(n);
}
