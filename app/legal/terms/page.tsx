export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updated="July 2026">
      <p>
        These Terms of Service ("Terms") govern your access to and use of the BVLOS Safety Academy website,
        courses, digital products, and consulting services (collectively, the "Services"), operated by{" "}
        <strong>Manuel Ignacio Pérez Pan (d/b/a BVLOS Safety Academy)</strong> ("BVLOS Safety Academy," "we," "us," or "our"). By creating an
        account, purchasing a course or product, or otherwise using the Services, you agree to these Terms. If
        you do not agree, do not use the Services.
      </p>

      <h2>1. Eligibility and Accounts</h2>
      <p>
        You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account and
        purchase Services. You are responsible for maintaining the confidentiality of your account credentials
        and for all activity that occurs under your account. Notify us immediately of any unauthorized use.
      </p>

      <h2>2. Courses and Certificates of Completion</h2>
      <p>
        Enrolling in a course grants you a personal, non-transferable, non-exclusive license to access that
        course's content for your own learning. Certificates of completion issued through the platform confirm
        completion of our internal program only.{" "}
        <strong>
          They do not constitute a regulatory license, rating, or authorization. See our{" "}
          <a href="/legal/disclaimer" className="text-gold-600 underline">
            Disclaimer
          </a>{" "}
          for full detail.
        </strong>
      </p>

      <h2>3. Digital Products</h2>
      <p>
        eBooks, templates, checklists, and other digital products are licensed, not sold, for your own internal
        use. Unless explicitly stated otherwise, you may not resell, redistribute, publicly share, or use
        purchased materials to create a competing product or service.
      </p>

      <h2>4. Consulting Services</h2>
      <p>
        Consulting engagements are governed by these Terms together with any separate proposal, statement of
        work, or service agreement signed between you and BVLOS Safety Academy, and our{" "}
        <a href="/legal/consulting-scope" className="text-gold-600 underline">
          Consulting Scope of Services
        </a>
        . In case of conflict, the signed statement of work controls.
      </p>

      <h2>5. Payments</h2>
      <p>
        Payments are processed by third-party payment processors (Stripe and/or PayPal). We do not store your
        full payment card details on our servers. Prices are listed in the currency shown at checkout and are
        exclusive of any taxes unless stated otherwise; you are responsible for any applicable taxes.
      </p>

      <h2>6. Refunds</h2>
      <p>
        Refunds are handled according to our{" "}
        <a href="/legal/refunds" className="text-gold-600 underline">
          Refund Policy
        </a>
        .
      </p>

      <h2>7. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Share your account credentials or course access with third parties;</li>
        <li>Copy, record, or redistribute course content without our written permission;</li>
        <li>Use the Services for any unlawful purpose or in violation of any applicable aviation regulation;</li>
        <li>Attempt to interfere with, disrupt, or gain unauthorized access to the platform.</li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <p>
        All course content, branding, templates, and platform design are the property of BVLOS Safety Academy or
        its licensors and are protected by copyright and other intellectual property laws. Nothing in these
        Terms transfers ownership of that content to you.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        The Services are provided "as is" and "as available," without warranties of any kind, express or
        implied, including but not limited to warranties of merchantability, fitness for a particular purpose,
        or non-infringement. We do not warrant that the Services will be uninterrupted, error-free, or that any
        course or consulting deliverable will achieve a particular regulatory or operational outcome.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, BVLOS Safety Academy and its owners, employees, and contributors
        shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any
        loss of profits, revenue, or data, arising out of or related to your use of the Services. Our total
        aggregate liability for any claim arising from the Services shall not exceed the amount you paid to us
        in the twelve (12) months preceding the claim.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of <strong>Delaware</strong>, United States,
        without regard to its conflict-of-laws principles. Any dispute arising from these Terms or the Services
        shall be resolved in the state or federal courts located in <strong>Delaware</strong>, and you
        consent to the personal jurisdiction of those courts.
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Services after a change takes effect
        constitutes acceptance of the revised Terms. Material changes will be reflected by updating the "Last
        updated" date above.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms can be sent to <strong>info@bvlossafetyacademy.com</strong>.
      </p>
    </LegalPageShell>
  );
}
