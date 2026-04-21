/**
 * SLIIT student emails: it + 8 alphanumeric chars @my.sliit.lk or bm + 8 @my.sliit.lk (prefix case-insensitive after normalize).
 */
const STUDENT_EMAIL_RE = /^((it|bm)[a-z0-9]{8})@my\.sliit\.lk$/;

const STUDENT_EMAIL_HINT =
  "Use your SLIIT student email: IT or BM followed by exactly 8 letters or numbers, then @my.sliit.lk (e.g. it12345678@my.sliit.lk or BM12ab34cd@my.sliit.lk). The IT/BM prefix is not case-sensitive.";

function isValidSliitStudentEmail(normalizedLowercaseEmail) {
  return typeof normalizedLowercaseEmail === "string" && STUDENT_EMAIL_RE.test(normalizedLowercaseEmail);
}

module.exports = {
  STUDENT_EMAIL_RE,
  STUDENT_EMAIL_HINT,
  isValidSliitStudentEmail,
};
