export const dynamic = "force-static";

import LegalPageShell from "@/components/LegalPageShell";
import { LEGAL_UPDATED } from "@/lib/legal";

export default function DisclaimerPage() {
  return (
    <LegalPageShell title="Disclaimer" updated={LEGAL_UPDATED}>
      <div className="callout">
        <p style={{ margin: 0 }}>
          <strong>BVLOS Safety Academy is an independent, privately owned training and consulting provider.</strong>{" "}
          We are not affiliated with, endorsed by, sponsored by, or certified by the Federal Aviation
          Administration (FAA), the European Union Aviation Safety Agency (EASA), the International Civil
          Aviation Organization (ICAO), or any other civil aviation authority, government agency, or regulatory
          body in any country.
        </p>
      </div>

      <h2>1. No Regulatory Certification or Authorization</h2>
      <p>
        Nothing offered on this platform — including course enrollment, course completion, certificates of
        completion, digital products, or consulting deliverables — constitutes a license, rating, certificate,
        authorization, approval, or endorsement issued by, or recognized by, any aviation authority. A
        "certificate of completion" issued by BVLOS Safety Academy confirms only that a learner has completed a
        specific training program offered by us. It does not authorize any person or organization to conduct
        BVLOS or any other flight operation, and it does not substitute for any license, waiver, exemption, or
        operational authorization required by the competent authority in the relevant jurisdiction.
      </p>

      <h2>1A. Relationship to FAA Requirements</h2>
      <p>
        Our courses are not FAA-approved or FAA-accredited. They do not replace the remote pilot certificate
        under 14 CFR Part 107 (which the FAA issues after its own knowledge test), and they do not grant or
        replace any Part 107 waiver, section 44807 exemption, Part 135 certificate, Certificate of Waiver or
        Authorization, or any other FAA authorization. We cannot promise that following our content will result
        in an FAA approval.
      </p>

      <h2>2. Educational and Informational Purpose</h2>
      <p>
        All courses, articles, reports, templates, and other content available through BVLOS Safety Academy are
        provided for general educational and informational purposes only. This content reflects the professional
        experience, interpretation, and opinion of our team and contributors at the time of publication. It is
        not, and should not be relied upon as, a substitute for:
      </p>
      <ul>
        <li>Reading and independently verifying the applicable laws, regulations, and guidance material in your jurisdiction;</li>
        <li>Direct consultation with the competent civil aviation authority; or</li>
        <li>Independent legal, regulatory, or professional advice specific to your operation.</li>
      </ul>
      <p>
        Regulations governing BVLOS and other UAS operations vary by country, change over time, and are subject
        to interpretation by the relevant authority. We make reasonable efforts to keep our content accurate and
        current, but we do not guarantee that it reflects the most recent regulatory requirements applicable to
        your specific operation.
      </p>

      <h2>3. Consulting Services</h2>
      <p>
        Where BVLOS Safety Academy provides consulting services — including but not limited to risk assessments,
        Concept of Operations (ConOps) documents, Safety Management System (SMS) design, or safety case
        documentation — these deliverables are advisory work products prepared according to our professional
        experience and understanding of applicable methodologies. They are intended to support, not replace, the
        client's own regulatory submission process.
      </p>
      <p>
        <strong>
          We do not guarantee, warrant, or represent that any deliverable will be approved, accepted, or
          recognized by any aviation authority.
        </strong>{" "}
        Final responsibility for the accuracy, completeness, and regulatory sufficiency of any submission rests
        solely with the operator submitting it. See our{" "}
        <a href="/legal/consulting-scope" className="text-gold-600 underline">
          Consulting Scope of Services
        </a>{" "}
        for further detail.
      </p>

      <h2>4. No Liability for Operational Decisions</h2>
      <p>
        BVLOS Safety Academy, its owners, employees, instructors, and contributors shall not be liable for any
        loss, damage, injury, regulatory action, denied authorization, or other consequence arising from
        decisions made or actions taken based on content provided through this platform. Operating an aircraft,
        crewed or uncrewed, carries inherent risk, and the ultimate responsibility for safe and lawful operation
        rests with the operator.
      </p>

      <h2>5. Software Tools, AI and Templates</h2>
      <p>
        AeroSafety Case, the SAFETI AI assistant and any other software tools referenced or linked from this
        platform are provided to support your own risk assessment process. Outputs are only as accurate as the
        data you provide and do not constitute a regulatory determination.{" "}
        <strong>
          AI-generated text and documents may contain errors or invented information. They are drafts that must
          be reviewed, completed and approved by a qualified person before use.
        </strong>{" "}
        Downloadable templates, checklists and example documents are generic and must be adapted to your own
        operation, aircraft, manuals and authorization. They are not legal advice and have not been approved or
        endorsed by the FAA, EASA, ICAO, JARUS or any authority. See the{" "}
        <a href="/legal/ai-use" className="text-gold-600 underline">AI Use Policy</a> and the{" "}
        <a href="/legal/app-terms" className="text-gold-600 underline">AeroSafety Case &amp; SAFETI Terms</a>.
      </p>

      <h2>6. Questions</h2>
      <p>
        If anything in this disclaimer is unclear, or if you have questions about the scope of a specific course
        or consulting engagement, contact us before enrolling or engaging our services.
      </p>
    </LegalPageShell>
  );
}
