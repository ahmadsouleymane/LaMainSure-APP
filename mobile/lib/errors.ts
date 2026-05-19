// Map Supabase auth errors to safe French messages.
// We never display raw error.message to the user (can leak internals / be in EN).
export function authErrorToFr(err: unknown): string {
  const raw = (err as { message?: string } | null)?.message?.toLowerCase() ?? '';
  if (raw.includes('invalid login') || raw.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (raw.includes('email not confirmed')) {
    return 'Confirme ton email avant de te connecter (vérifie tes spams).';
  }
  if (raw.includes('user already registered') || raw.includes('already exists')) {
    return 'Un compte existe déjà avec cet email.';
  }
  if (raw.includes('password') && raw.includes('short')) {
    return 'Mot de passe trop court (8 caractères minimum).';
  }
  if (raw.includes('rate limit') || raw.includes('too many')) {
    return 'Trop de tentatives. Réessaie dans quelques minutes.';
  }
  if (raw.includes('network') || raw.includes('fetch')) {
    return 'Problème de connexion. Vérifie ton réseau.';
  }
  return 'Une erreur est survenue. Réessaie.';
}

export function isValidEmail(email: string): boolean {
  // Pragmatic check — real validation happens server-side.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return 'Le mot de passe doit faire 8 caractères minimum.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
    return 'Le mot de passe doit contenir lettres et chiffres.';
  }
  return null;
}
