export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_UPDATED, CONTACT_EMAIL } from "@/lib/legal";

export default function AppTermsPage() {
  return (
    <LegalPageShell title="AeroSafety Case & SAFETI Terms of Use" updated={LEGAL_UPDATED}>
      <p>
        These terms apply to the AeroSafety Case web app and its AI assistant SAFETI (together, the "App"),
        provided by <strong>Manuel Ignacio Pérez Pan (d/b/a BVLOS Safety Academy)</strong>. They supplement our{" "}
        <a href="/legal/terms" className="text-gold-600 underline">Terms of Service</a>,{" "}
        <a href="/legal/privacy" className="text-gold-600 underline">Privacy Policy</a>,{" "}
        <a href="/legal/disclaimer" className="text-gold-600 underline">Disclaimer</a> and{" "}
        <a href="/legal/ai-use" className="text-gold-600 underline">AI Use Policy</a>. By using the App you agree to all of them.
      </p>

      <div className="callout">
        <p style={{ margin: 0 }}>
          <strong>The App is a decision-support and documentation tool.</strong> It does not approve, certify or
          authorize any flight operation, and nothing it produces is an FAA, EASA or other regulator approval.
          The operator and the remote pilot in command remain fully responsible for every flight and for every
          document they submit to an authority.
        </p>
      </div>

      <h2>1. What the App does</h2>
      <p>
        The App helps you describe a UAS mission, identify hazards, apply controls, rate risk with a
        severity/likelihood matrix based on public FAA and ICAO guidance, and print a mission report. SAFETI is an
        AI assistant that can suggest or draft missions, hazards, controls and safety documents. Matrix values,
        wording and examples are illustrative and may not match the method your authority or customer requires.
      </p>

      <h2>2. Your responsibility</h2>
      <ul>
        <li>Check every result against the current regulations, your aircraft manuals, your operations manual and any authorization, waiver or exemption you hold.</li>
        <li>Do not fly, or let anyone fly, only because the App rated a mission as acceptable.</li>
        <li>Review, complete and approve every AI draft before you use or submit it. Drafts contain placeholders such as "[to be completed: …]" that you must fill with real, verified information.</li>
        <li>Make sure the data you enter (coordinates, aircraft data, airspace, weather, people and property) is accurate and current.</li>
      </ul>

      <h2>3. Where your data is stored</h2>
      <p>
        Missions, fleet and organization details you enter are stored <strong>in your own browser</strong> (local
        storage) on the device you use. We do not keep a copy and we cannot recover them. If you clear your
        browser data, use private browsing, switch devices or lose the device, your missions are lost. Print
        or save your reports and keep your own backups.
      </p>
      <p>
        When you use an AI feature, the text you type and the mission data needed to answer are sent to our
        server and to our AI provider (Anthropic) to generate the response. We keep a usage record (account ID,
        type of action, time and token counts) to apply usage limits. SAFETI conversations and generated
        documents are saved in your browser, not on our servers. See the Privacy Policy and AI Use Policy.
      </p>

      <h2>4. Accounts and usage limits</h2>
      <p>
        AI features require a BVLOS Safety Academy account. We may limit how many AI requests you can make,
        change those limits, or change, suspend or end any feature at any time. Features may be offered free
        for a limited time or paid in the future.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>No unlawful operations, and no use of the App to evade, mislead or falsify information to any aviation authority, customer or insurer.</li>
        <li>No attempts to break, probe, overload or scrape the App, or to bypass usage limits.</li>
        <li>No entering of passwords, payment data, health data, government identifiers, classified or export-controlled information, or confidential third-party information you are not allowed to share.</li>
        <li>No resale or white-labelling of the App or its outputs as your own software.</li>
      </ul>

      <h2>6. Ownership and license</h2>
      <p>
        You keep ownership of the content you enter and of the documents you generate and edit. You give us
        permission to process that content only to run the App and the AI features you request. The App's code,
        design, prompts, matrices and branding belong to BVLOS Safety Academy. You get a limited, revocable,
        non-transferable license to use the App for your own operations.
      </p>

      <h2>7. No warranty; limits of liability</h2>
      <p>
        The App is provided "as is" and "as available". AI output can be wrong, incomplete or out of date. To the
        maximum extent permitted by law, Sections 9 (Disclaimer of Warranties), 10 (Limitation of Liability) and
        11 (Governing Law) of the Terms of Service apply to the App, and we are not liable for any flight
        decision, accident, regulatory action, denied authorization or loss arising from your use of it.
      </p>

      <h2>8. Changes and contact</h2>
      <p>
        We may update these terms; the version shown when you use the App applies. Questions or error reports:{" "}
        <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalPageShell>
  );
}
