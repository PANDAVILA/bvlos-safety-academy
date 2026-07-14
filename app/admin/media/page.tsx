export const dynamic = "force-dynamic";

import { getUploadsDir } from "@/lib/uploads";
import { deleteUpload } from "@/lib/actions/media";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import Image from "next/image";
import fs from "fs";
import path from "path";

export default function MediaLibraryPage() {
  const dir = getUploadsDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith("."))
    .map((f) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <h1 className="mt-2 font-display text-3xl text-navy-900">Media Library</h1>
      <p className="mt-2 text-navy-900/60">
        Every image you've uploaded from any admin form. Copy a URL to reuse it elsewhere.
      </p>

      {files.length === 0 ? (
        <p className="mt-8 text-navy-900/50">
          No uploads yet — upload an image from the Homepage, Courses, News, or Resources editors.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => {
            const url = `/api/uploads/${f.name}`;
            return (
              <div key={f.name} className="border border-navy-900/10 bg-white">
                <div className="relative aspect-square">
                  <Image src={url} alt={f.name} fill className="object-cover" unoptimized />
                </div>
                <div className="p-2">
                  <input
                    readOnly
                    value={url}
                    className="w-full border border-navy-900/10 bg-navy-900/5 px-2 py-1 text-[10px] text-navy-900/60"
                  />
                  <form action={deleteUpload.bind(null, f.name)} className="mt-2">
                    <ConfirmSubmitButton
                      confirmMessage="Delete this image? Any page still referencing it will show a broken image."
                      className="eyebrow w-full text-red-600 hover:text-red-800"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
