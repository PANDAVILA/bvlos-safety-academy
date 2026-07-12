export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";

export default function RefundsPage() {
  return (
    <LegalPageShell title="Refund Policy" updated="July 2026">
      <h2>1. Courses</h2>
      <p>
        You may request a full refund for a paid course within <strong>14 days</strong> of purchase, provided you
        have completed less than 20% of the course content. To request a refund, contact{" "}
        <strong>info@bvlossafetyacademy.com</strong> with your order reference.
      </p>

      <h2>2. Digital Products (eBooks, Templates, Checklists)</h2>
      <p>
        Because digital products are delivered instantly and can be copied, all sales are final once the file has
        been downloaded or accessed, except where required otherwise by applicable law.
      </p>
      <div className="callout">
        <p style={{ margin: 0 }}>
          <strong>For customers in the European Union:</strong> under EU consumer law you normally have a 14-day
          right of withdrawal for online purchases. For digital content delivered immediately, this right does
          not apply once you expressly consent to immediate delivery and acknowledge you lose the right of
          withdrawal — which you do at checkout. If you have not yet downloaded or accessed the product, contact
          us within 14 days for a refund.
        </p>
      </div>

      <h2>3. Consulting Services</h2>
      <p>
        Refunds for consulting engagements are governed by the payment terms set out in the applicable proposal
        or statement of work. As a general principle: deposits are non-refundable once work has begun; fees for
        work already performed are non-refundable; unearned fees for work not yet started may be refunded at our
        discretion.
      </p>

      <h2>4. How Refunds Are Issued</h2>
      <p>
        Approved refunds are issued to the original payment method (via Stripe or PayPal) within 5–10 business
        days. We do not offer cash or alternate-method refunds.
      </p>

      <h2>5. Chargebacks</h2>
      <p>
        Please contact us before filing a chargeback with your bank or card issuer — most issues can be resolved
        directly and faster this way. Accounts associated with fraudulent chargebacks may be suspended.
      </p>

      <h2>6. Contact</h2>
      <p>
        For any refund request, email <strong>info@bvlossafetyacademy.com</strong> with your name, order reference, and
        reason for the request.
      </p>
    </LegalPageShell>
  );
}
