"use client";

import { CameraIcon } from "./icons";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function EditableStudentPhoto({
  studentName,
  photoUrl,
  updatePhotoAction,
}: {
  studentName: string;
  photoUrl: string | null;
  updatePhotoAction: (formData: FormData) => void;
}) {
  return (
    <form
      action={updatePhotoAction}
      className="relative h-16 w-16 shrink-0"
    >
      <label className="block h-16 w-16 cursor-pointer overflow-hidden rounded-pill bg-blue/10">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={studentName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-heading text-lg font-semibold text-blue">
            {initials(studentName)}
          </div>
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
      </label>
      <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-pill bg-navy text-white shadow-card">
        <CameraIcon />
      </span>
    </form>
  );
}
