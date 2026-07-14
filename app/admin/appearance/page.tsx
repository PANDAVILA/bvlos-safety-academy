export const dynamic = "force-dynamic";

import { getTheme, defaultTheme } from "@/lib/theme";
import { updateTheme, resetTheme } from "@/lib/actions/theme";
import ColorField from "@/components/ColorField";

export default async function AppearancePage() {
  const theme = await getTheme();

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <h1 className="mt-2 font-display text-3xl text-navy-900">Appearance</h1>
      <p className="mt-2 max-w-xl text-navy-900/60">
        Change your two brand colors. Every button, heading accent, and dark section across the site updates
        automatically — no code changes needed.
      </p>

      <form action={updateTheme} className="mt-8 max-w-xl space-y-6 border border-navy-900/10 bg-white p-6">
        <div className="grid grid-cols-2 gap-6">
          <ColorField name="theme_navy" label="Primary (navy)" defaultValue={theme.navy} />
          <ColorField name="theme_gold" label="Accent (gold)" defaultValue={theme.gold} />
        </div>

        <p className="text-xs text-navy-900/40">
          Tip: click the swatch to pick visually, or paste an exact hex code in the field next to it.
        </p>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
            Save colors
          </button>
        </div>
      </form>

      <form action={resetTheme} className="mt-4">
        <button type="submit" className="eyebrow text-navy-900/40 hover:text-navy-900">
          Reset to default colors (navy {defaultTheme.navy} / gold {defaultTheme.gold})
        </button>
      </form>
    </div>
  );
}
