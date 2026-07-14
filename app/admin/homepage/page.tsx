export const dynamic = "force-dynamic";

import { getHomepageContent } from "@/lib/site-content";
import { updateHomepageContent } from "@/lib/actions/site-content";
import { ExternalLink } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";

export default async function AdminHomepagePage() {
  const content = await getHomepageContent();

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <div className="flex items-center justify-between">
        <h1 className="mt-2 font-display text-3xl text-navy-900">Homepage</h1>
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-navy-900/60 hover:text-gold-600">
          View live page <ExternalLink size={14} />
        </a>
      </div>
      <p className="mt-2 text-navy-900/60">Edit the hero section text, image, and buttons on your homepage.</p>

      <form action={updateHomepageContent} className="mt-8 max-w-2xl space-y-8">
        <div className="space-y-5 border border-navy-900/10 bg-white p-6">
          <p className="eyebrow text-gold-600">Hero text</p>
          <div>
            <label className="eyebrow text-navy-900/60">Eyebrow (small label above the title)</label>
            <input
              name="hero_eyebrow"
              defaultValue={content.hero_eyebrow}
              className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Main title</label>
            <textarea
              name="hero_title"
              defaultValue={content.hero_title}
              rows={3}
              className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Subtitle</label>
            <textarea
              name="hero_subtitle"
              defaultValue={content.hero_subtitle}
              rows={3}
              className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-5 border border-navy-900/10 bg-white p-6">
          <p className="eyebrow text-gold-600">Hero image</p>
          <ImageUploadField name="hero_image" label="Image" defaultValue={content.hero_image} />
          <div>
            <label className="eyebrow text-navy-900/60">Image size</label>
            <select
              name="hero_image_size"
              defaultValue={content.hero_image_size}
              className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none"
            >
              <option value="sm">Small</option>
              <option value="md">Medium (default)</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </div>

        <div className="space-y-5 border border-navy-900/10 bg-white p-6">
          <p className="eyebrow text-gold-600">Buttons</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow text-navy-900/60">Primary button text</label>
              <input name="primary_cta_text" defaultValue={content.primary_cta_text} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
            </div>
            <div>
              <label className="eyebrow text-navy-900/60">Primary button link</label>
              <input name="primary_cta_href" defaultValue={content.primary_cta_href} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow text-navy-900/60">Secondary button text</label>
              <input name="secondary_cta_text" defaultValue={content.secondary_cta_text} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
            </div>
            <div>
              <label className="eyebrow text-navy-900/60">Secondary button link</label>
              <input name="secondary_cta_href" defaultValue={content.secondary_cta_href} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-5 border border-navy-900/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-gold-600">Section: "Compliance is not safety"</p>
            <label className="flex items-center gap-2 text-xs text-navy-900/60">
              <input type="checkbox" name="section2_visible" defaultChecked={content.section2_visible === "true"} />
              Visible on site
            </label>
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Eyebrow</label>
            <input name="section2_eyebrow" defaultValue={content.section2_eyebrow} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Title</label>
            <input name="section2_title" defaultValue={content.section2_title} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Body text</label>
            <textarea name="section2_body" defaultValue={content.section2_body} rows={4} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <ImageUploadField name="section2_image" label="Image" defaultValue={content.section2_image} />
        </div>

        <div className="space-y-5 border border-navy-900/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-gold-600">Section: "Operational Drift"</p>
            <label className="flex items-center gap-2 text-xs text-navy-900/60">
              <input type="checkbox" name="section3_visible" defaultChecked={content.section3_visible === "true"} />
              Visible on site
            </label>
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Eyebrow</label>
            <input name="section3_eyebrow" defaultValue={content.section3_eyebrow} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Title</label>
            <input name="section3_title" defaultValue={content.section3_title} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Body text</label>
            <textarea name="section3_body" defaultValue={content.section3_body} rows={4} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <ImageUploadField name="section3_image" label="Image" defaultValue={content.section3_image} />
        </div>

        <button type="submit" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
          Save changes
        </button>
      </form>
    </div>
  );
}
