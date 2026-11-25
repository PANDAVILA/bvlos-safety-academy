const COMMON = new Set([
  "password", "password1", "password12", "password123", "passw0rd", "12345678", "123456789", "1234567890",
  "qwertyuiop", "qwerty123", "iloveyou1", "admin12345", "welcome123", "letmein123", "abc123456", "11111111",
  "bvlos1234", "drone12345", "dronepilot",
]);

/** Returns an error message, or null when the password is acceptable. */
export function passwordProblem(pw: string, email?: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (pw.length > 200) return "That password is too long.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Include at least one letter and one number.";
  if (COMMON.has(pw.toLowerCase())) return "That password is too common. Choose another one.";
  if (email) {
    const local = email.split("@")[0].toLowerCase();
    if (local.length >= 4 && pw.toLowerCase().includes(local)) return "Do not use your email name in the password.";
  }
  return null;
}
