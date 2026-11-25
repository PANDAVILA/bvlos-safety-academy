export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_UPDATED, CONTACT_EMAIL } from "@/lib/legal";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated={LEGAL_UPDATED}>
      <p>
        This Privacy Policy explains how <strong>Manuel Ignacio Pérez Pan (d/b/a BVLOS Safety Academy)</strong>, operating as BVLOS Safety
        Academy ("we," "us," "our"), collects, uses, and protects your personal information when you use our
        website and Services.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Information you provide directly</h3>
      <ul>
        <li>Name, email address, and password when you create an account, and the date you accepted our Terms;</li>
        <li>Company/operator name and country, if provided;</li>
        <li>Information submitted through contact or consulting-inquiry forms (name, email, company, message);</li>
        <li>Content of communications you send us.</li>
      </ul>
      <h3>Information from payments</h3>
      <p>
        Payments are processed by Stripe and/or PayPal. We receive confirmation of payment, the amount, and an
        order reference from these processors — we do <strong>not</strong> receive or store your full card number
        or banking credentials.
      </p>
      <h3>Information collected automatically</h3>
      <ul>
        <li>Log data such as IP address, browser type, and pages visited;</li>
        <li>Course progress and completion data, tied to your account.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and manage your account and course enrollments;</li>
        <li>To process payments and deliver purchased courses and digital products;</li>
        <li>To respond to consulting inquiries and support requests;</li>
        <li>To send you service-related communications (e.g., course updates, receipts);</li>
        <li>With your consent, to send you news or marketing communications, which you may opt out of at any time;</li>
        <li>To maintain the security and integrity of the platform.</li>
      </ul>

      <h2>3. How We Share Information</h2>
      <p>We share personal information only with:</p>
      <ul>
        <li><strong>Payment processors</strong> (Stripe, PayPal) to process your transactions;</li>
        <li><strong>Hosting and infrastructure providers</strong> that store and run the platform on our behalf;</li>
        <li><strong>AI service provider</strong> (Anthropic): when you use the AI tools or the SAFETI chat assistant in AeroSafety Case, the messages you type and the data of the mission open in the app (such as operation details, coordinates, aircraft data and hazards, without the names of crew members unless you type them) are sent to Anthropic&rsquo;s API to generate the answer. We do not send your email or password. Do not type personal data you do not need;</li>
        <li>Authorities, where required by law or to protect our legal rights.</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>4. Data Retention</h2>
      <ul>
        <li><strong>Account and course data:</strong> kept while your account is active. After a verified deletion request we delete or anonymize it within 30 days, except where the law requires us to keep it.</li>
        <li><strong>Order and payment records:</strong> kept as required for tax and accounting (generally up to 7 years), together with the record of the terms you accepted.</li>
        <li><strong>Contact and consulting inquiries:</strong> kept for up to 24 months after our last contact, or until you ask us to delete them.</li>
        <li><strong>Server logs:</strong> kept for a limited period by our hosting provider for security and troubleshooting.</li>
        <li><strong>AI usage records:</strong> account ID, action type, time and token counts, kept while your account is active.</li>
      </ul>

      <h2>5. Where Your Information Is Processed</h2>
      <p>
        The Services are directed to users in the United States. Our hosting and service providers may store
        and process information in the United States and in other countries where they operate, and it may be
        accessed from outside the United States by the operator and those providers. We require our providers to
        protect it under their own security and privacy commitments.
      </p>

      <h2>6. Your Privacy Rights</h2>
      <p>
        Depending on where you live (for example California, Colorado, Connecticut, Virginia, Texas and other
        states with privacy laws), you may have the right to:
      </p>
      <ul>
        <li>Know and access the personal information we hold about you, and get a copy;</li>
        <li>Correct inaccurate information;</li>
        <li>Delete your account and associated data;</li>
        <li>Opt out of the sale or sharing of personal information and of targeted advertising or profiling. <strong>We do not sell or share your personal information for advertising, and we do not use it for targeted advertising or profiling;</strong></li>
        <li>Limit use of sensitive information. We do not collect sensitive personal information as defined by those laws;</li>
        <li>Withdraw consent for marketing messages at any time, and not be treated unfairly for using these rights.</li>
      </ul>
      <p>
        To make a request, email <strong>{CONTACT_EMAIL}</strong> from the address linked to your account. We may
        need to verify your identity, and we will respond within 45 days (we will tell you if we need more
        time). If we deny a request, you may appeal by replying to our message, and you may also contact your
        state attorney general. You may use an authorized agent, with written proof.
      </p>
      <p>
        <strong>Categories collected in the last 12 months:</strong> identifiers (name, email, IP address);
        commercial information (orders and course enrollments); internet activity (logs, course progress); and
        content you send us (messages, AI prompts). We collect them from you and from your use of the Services,
        and disclose them only to the providers listed in Section 3 for business purposes.
      </p>

      <h2>7. Cookies, Local Storage and Tracking</h2>
      <p>
        We use only essential cookies for login sessions and security. We do not use advertising or
        cross-site tracking cookies, and we do not respond to "Do Not Track" signals because we do not track you
        across other sites. Course videos are embedded in privacy-enhanced modes (YouTube no-cookie, Vimeo
        do-not-track), but the video provider may still receive technical data such as your IP address when you
        press play. PayPal buttons load scripts from PayPal. AeroSafety Case stores your missions and AI chats in
        your browser's local storage on your device. If we add analytics or marketing tools, we will update this
        policy first and give any required choices.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        Our Services are for professional and adult use (18+) and are not directed at children. We do not
        knowingly collect personal information from anyone under 13 (or under 18 for accounts). If you believe a
        child gave us information, contact us and we will delete it.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your information, including password
        hashing, encrypted connections, access controls and rate limits (see our{" "}
        <a href="/legal/security" className="text-gold-600 underline">Security page</a>). No method of transmission or
        storage is 100% secure. If a breach affects your information, we will notify you as required by law.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
        "Last updated" date above.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this Privacy Policy can be sent to <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalPageShell>
  );
}
