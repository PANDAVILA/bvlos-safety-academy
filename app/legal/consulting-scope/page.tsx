export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";

export default function ConsultingScopePage() {
  return (
    <LegalPageShell title="Consulting Scope of Services" updated="July 2026">
      <p>
        This page describes the general nature and limits of the consulting services offered by BVLOS Safety
        Academy. It applies to all consulting engagements — including risk assessments, Concept of Operations
        (ConOps) design, Safety Management System (SMS) design and audit, and safety case documentation — unless
        a signed statement of work between you and BVLOS Safety Academy states otherwise, in which case the
        signed document controls.
      </p>

      <h2>1. Nature of the Work</h2>
      <p>
        Our consulting deliverables are advisory work products, prepared according to the professional experience
        of our team and our understanding of relevant methodologies (such as SMS-based risk assessment
        frameworks). They are designed to help you build a stronger, better-organized operational dossier.
      </p>
      <div className="callout">
        <p style={{ margin: 0 }}>
          <strong>We are not a government body, and we do not have the authority to approve, certify, or
          authorize any flight operation.</strong> Only the competent civil aviation authority in your
          jurisdiction can grant that approval.
        </p>
      </div>

      <h2>2. What We Do Not Guarantee</h2>
      <ul>
        <li>That any authority will approve, accept, or process a submission that includes our deliverables;</li>
        <li>That our risk classifications, mitigations, or recommendations will be accepted without modification by a reviewing authority;</li>
        <li>That regulatory requirements will not change between the time of our engagement and your submission;</li>
        <li>Any specific timeline for regulatory approval, which is entirely outside our control.</li>
      </ul>

      <h2>3. Client Responsibilities</h2>
      <p>As the operator, you remain responsible for:</p>
      <ul>
        <li>Reviewing and validating all deliverables before submission to any authority;</li>
        <li>Ensuring the accuracy of all operational data and assumptions you provide us, which our work relies on;</li>
        <li>Final compliance with all applicable laws and regulations in your jurisdiction;</li>
        <li>Any operational decision made using our deliverables.</li>
      </ul>

      <h2>4. Confidentiality</h2>
      <p>
        We treat information shared with us during a consulting engagement as confidential and will not disclose
        it to third parties except as required to perform the engagement or as required by law.
      </p>

      <h2>5. Engagement Terms</h2>
      <p>
        Fees, deliverables, and timelines for a specific engagement are set out in a separate proposal or
        statement of work provided before work begins. No consulting work begins without your written agreement
        to that scope.
      </p>

      <h2>6. Questions Before You Engage Us</h2>
      <p>
        If you are unsure whether our services fit your specific regulatory situation, ask us before engaging —
        we would rather clarify scope upfront than leave you with the wrong expectations.
      </p>
    </LegalPageShell>
  );
}
