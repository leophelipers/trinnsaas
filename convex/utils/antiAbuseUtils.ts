/**
 * Utilitários Antifraude e Normalização de E-mail para Convex (100% Gratuito)
 */

// Lista de domínios descartáveis / temporários mais comuns e abusados internacionalmente e no Brasil
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Provedores populares de Temp Mail
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minutemail.co.uk",
  "tempmail.com",
  "temp-mail.org",
  "tempmail.net",
  "tempmailaddress.com",
  "tempail.com",
  "guerrillamail.com",
  "guerrillamail.biz",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "mailinator.com",
  "mailinater.com",
  "mailinator2.com",
  "suremail.info",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "throwawaymail.com",
  "burnermail.io",
  "dispostable.com",
  "getairmail.com",
  "fakeinbox.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "trashmail.io",
  "mohmal.com",
  "mytemp.email",
  "generator.email",
  "emailondeck.com",
  "crazymailing.com",
  "disposablemail.com",
  "nada.ltd",
  "inboxkitten.com",
  "getnada.com",
  "abacusmail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "chacuo.net",
  "maildrop.cc",
  "harakirimail.com",
  "tmailor.com",
  "minuteinbox.com",
  "emailfake.com",
  "fakemailgenerator.com",
  "discard.email",
  "spambog.com",
  "temporary-mail.net",
  "fakemail.net",
  "trash-mail.at",
  "trash-mail.com",
  "trash-mail.ch",
  "trash-mail.de",
  "trash-mail.org",
  "mailnull.com",
  "anonymbox.com",
  "tempinbox.com",
  "mytempmail.com",
  "crazymail.com",
  "boun.cr",
  "crazymailing.com",
  "drdrb.net",
  "drdrb.com",
  "dropmail.me",
  "email-temp.com",
  "fastmail.fm",
  "inboxalias.com",
  "incognitomail.org",
  "kasmail.com",
  "mailcatch.com",
  "mailsac.com",
  "mytrashmail.com",
  "noclickemail.com",
  "pookmail.com",
  "spamavert.com",
  "spamfree24.org",
  "spaml.com",
  "spamspot.com",
  "tempemail.net",
  "trashcanmail.com",
  "wegwerfadresse.de",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "whyspam.me",
  "yomail.info",
  "zoemail.org",
]);

// Expressões regulares para capturar variações e subdomínios comuns de descarte
const DISPOSABLE_REGEX =
  /(^|\.)(temp.*mail|throwaway|disposable|fake.*mail|burner.*mail|guerrilla.*mail|trash.*mail|10minute.*mail|mohmal|yopmail|mailinator|sharklasers|mytemp|generator.*email|emailondeck|minuteinbox|inboxkitten|maildrop)\./i;

/**
 * Verifica se um domínio de e-mail é temporário/descartável.
 */
export function isDisposableEmailDomain(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().trim();
  if (DISPOSABLE_EMAIL_DOMAINS.has(cleanDomain)) {
    return true;
  }
  return DISPOSABLE_REGEX.test(cleanDomain);
}

export interface NormalizedEmailInfo {
  originalEmail: string;
  canonicalEmail: string;
  domain: string;
  localPart: string;
  hasAlias: boolean;
  isGmail: boolean;
  isDisposable: boolean;
}

/**
 * Normaliza um e-mail removendo truques de alias (+tag) e pontos no Gmail,
 * identificando a identidade canônica real do usuário.
 */
export function normalizeEmail(email: string): NormalizedEmailInfo {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex <= 0) {
    return {
      originalEmail: email,
      canonicalEmail: trimmed,
      domain: "",
      localPart: trimmed,
      hasAlias: false,
      isGmail: false,
      isDisposable: false,
    };
  }

  let localPart = trimmed.substring(0, atIndex);
  let domain = trimmed.substring(atIndex + 1);

  // Normalizar googlemail.com para gmail.com
  if (domain === "googlemail.com") {
    domain = "gmail.com";
  }

  const isGmail = domain === "gmail.com";
  let hasAlias = false;

  // Provedores que suportam subaddressing com '+' (Gmail, Outlook, Hotmail, iCloud, Proton, Fastmail, Yahoo)
  if (localPart.includes("+")) {
    hasAlias = true;
    localPart = localPart.split("+")[0];
  }

  // O Gmail ignora pontos no localPart (ex: j.o.a.o -> joao)
  if (isGmail) {
    localPart = localPart.replace(/\./g, "");
  }

  const canonicalEmail = `${localPart}@${domain}`;
  const isDisposable = isDisposableEmailDomain(domain);

  return {
    originalEmail: email,
    canonicalEmail,
    domain,
    localPart,
    hasAlias,
    isGmail,
    isDisposable,
  };
}
