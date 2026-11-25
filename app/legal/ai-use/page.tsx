export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_UPDATED, CONTACT_EMAIL } from "@/lib/legal";

export default function AiUsePage() {
  return (
    <LegalPageShell title="AI Use Policy" updated={LEGAL_UPDATED}>
      <p>
        BVLOS Safety Academy offers AI-assisted tools, including the AI review, hazard and report tools and the
        SAFETI assistant in AeroSafety Case. This policy explains what they can and cannot do and how to use
        them safely.
      </p>

      <div className="callout">
        <p style={{ margin: 0 }}>
          <strong>AI can be wrong.</strong> It can invent regulations, misquote numbers, miss hazards and sound
          confident while doing so. A qualified person must review everything before it is used in an operation
          or sent to an authority.
        </p>
      </div>

      <h2>1. What the AI does</h2>
      <ul>
        <li>Builds and reviews missions, suggests hazards, controls and residual risk, and drafts safety documents (for example SMS manual, risk assessment, ConOps, emergency plan, checklists).</li>
        <li>SAFETI proposes changes to your mission as cards. <strong>Nothing is applied until you press Apply.</strong></li>
        <li>Every draft is a starting point with placeholders you must complete. Drafts are not FAA-approved, not legal advice and not a regulatory determination.</li>
      </ul>

      <h2>2. Your duties when using the AI</h2>
      <ul>
        <li>Review every answer and document with a qualified person. The accountable manager or remote pilot in command signs and owns the final version.</li>
        <li>Verify regulatory statements against the current official sources (for example the eCFR, FAA advisory circulars and your authorization or waiver).</li>
        <li>Never submit AI text to an authority, customer or insurer as if it were verified fact.</li>
        <li>Do not use the AI to create false records, hide hazards or mislead anyone about safety.</li>
      </ul>

      <h2>3. What not to type</h2>
      <p>
        Avoid personal data you do not need (names, phone numbers, addresses of crew or bystanders), passwords,
        payment details, health information, classified or export-controlled technical data, and confidential
        information of third parties without their permission.
      </p>

      <h2>4. Where your data goes</h2>
      <ul>
        <li>The messages you type and the mission data needed for the answer are sent through our server to <strong>Anthropic</strong>, our AI provider, to generate the response. We do not send your password or payment data.</li>
        <li>Under Anthropic's commercial API terms, inputs and outputs are not used to train its models by default. Anthropic's own policies govern what it keeps and for how long.</li>
        <li>We store a usage record (account ID, type of action, time, token counts), not the text of your conversations. Chats and generated documents are saved in your browser.</li>
      </ul>

      <h2>5. Limits and availability</h2>
      <p>
        AI use is limited per account and per day, and may change. We may suspend AI features at any time, for
        example for maintenance, cost or abuse.
      </p>

      <h2>6. Report a problem</h2>
      <p>
        If the AI gives wrong or unsafe information, tell us at <strong>{CONTACT_EMAIL}</strong> with what you
        asked and what it answered. We use these reports to improve the prompts and checks.
      </p>
      <p>
        See also the <a href="/legal/app-terms" className="text-gold-600 underline">AeroSafety Case &amp; SAFETI Terms of Use</a>,
        the <a href="/legal/privacy" className="text-gold-600 underline">Privacy Policy</a> and the{" "}
        <a href="/legal/disclaimer" className="text-gold-600 underline">Disclaimer</a>.
      </p>
    </LegalPageShell>
  );
}
