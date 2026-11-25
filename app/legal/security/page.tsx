export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_UPDATED, CONTACT_EMAIL } from "@/lib/legal";

export default function SecurityPage() {
  return (
    <LegalPageShell title="Security & Responsible Disclosure" updated={LEGAL_UPDATED}>
      <p>
        We take the security of the BVLOS Safety Academy site and the AeroSafety Case app seriously. This page
        explains the main protections we use and how to report a vulnerability.
      </p>

      <h2>1. How we protect the platform</h2>
      <ul>
        <li>Encrypted connections (HTTPS) and standard browser security headers.</li>
        <li>Passwords are stored only as salted hashes, never in plain text.</li>
        <li>Card payments are handled by Stripe and PayPal. We never see or store your card number.</li>
        <li>Rate limits on sign-in, registration, forms and checkout to slow down automated abuse.</li>
        <li>Role-based access for administration, and usage limits on AI features.</li>
        <li>AeroSafety Case keeps your missions in your own browser rather than on our servers.</li>
      </ul>

      <h2>2. What you can do</h2>
      <ul>
        <li>Use a long, unique password and do not share your account.</li>
        <li>Sign out on shared computers, and keep your browser updated.</li>
        <li>Tell us at once if you think your account was accessed without permission.</li>
      </ul>

      <h2>3. Report a vulnerability</h2>
      <p>
        If you find a security problem, email <strong>{CONTACT_EMAIL}</strong> with the subject "Security report".
        Include the affected page or endpoint, the steps to reproduce it and the potential impact. Please give us
        a reasonable time to fix it before sharing details publicly. We will acknowledge reports as soon as we
        can; we do not run a paid bounty program.
      </p>

      <h2>4. Good-faith research</h2>
      <p>
        We will not take legal action against people who test in good faith, follow this policy and: do not
        access, change or keep other people's data beyond the minimum needed to show the issue; do not disrupt
        the service (no denial-of-service, spam or heavy automated scanning); and do not use social engineering
        or physical attacks. Testing third-party services we use (Stripe, PayPal, Railway, Anthropic) must follow
        their own rules.
      </p>

      <h2>5. Data incidents</h2>
      <p>
        If personal information is affected by a security incident, we will notify the people and authorities
        required by applicable law without undue delay.
      </p>
      <p>
        Our machine-readable contact is published at{" "}
        <a href="/.well-known/security.txt" className="text-gold-600 underline">/.well-known/security.txt</a>.
      </p>
    </LegalPageShell>
  );
}
