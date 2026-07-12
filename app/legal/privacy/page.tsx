export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="July 2026">
      <p>
        This Privacy Policy explains how <strong>Manuel Ignacio Pérez Pan (d/b/a BVLOS Safety Academy)</strong>, operating as BVLOS Safety
        Academy ("we," "us," "our"), collects, uses, and protects your personal information when you use our
        website and Services.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Information you provide directly</h3>
      <ul>
        <li>Name, email address, and password when you create an account;</li>
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
        <li>Authorities, where required by law or to protect our legal rights.</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>4. Data Retention</h2>
      <p>
        We retain account and course data for as long as your account is active, and for a reasonable period
        afterward to comply with legal, accounting, or reporting obligations. You may request deletion of your
        account at any time, subject to Section 6.
      </p>

      <h2>5. International Users</h2>
      <p>
        If you access the Services from outside the United States, your information will be transferred to and
        processed in the United States and any other country where our service providers operate. Where required
        by applicable law (such as the EU General Data Protection Regulation), we rely on appropriate safeguards
        for such transfers.
      </p>

      <h2>6. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you;</li>
        <li>Request correction of inaccurate information;</li>
        <li>Request deletion of your account and associated data;</li>
        <li>Object to or restrict certain processing;</li>
        <li>Withdraw consent for marketing communications at any time.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at <strong>info@bvlossafetyacademy.com</strong>.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use essential cookies required for login sessions and platform functionality. If we add analytics or
        marketing cookies in the future, we will request consent where required by law and update this policy
        accordingly.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        Our Services are intended for professional and adult use and are not directed at children under 16. We do
        not knowingly collect personal information from children.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your information, including password
        hashing and encrypted connections. No method of transmission or storage is 100% secure, and we cannot
        guarantee absolute security.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
        "Last updated" date above.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about this Privacy Policy can be sent to <strong>info@bvlossafetyacademy.com</strong>.
      </p>
    </LegalPageShell>
  );
}
