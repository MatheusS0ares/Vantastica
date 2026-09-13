"use client";

import { CameraIcon } from "./icons";
import { compressFileInput } from "@/lib/compressImage";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const SIZE_CLASSES = {
  sm: {
    wrapper: "h-16 w-16",
    initials: "text-lg",
    badge: "h-6 w-6",
    iconSize: 14,
  },
  lg: {
    wrapper: "h-32 w-32",
    initials: "text-4xl",
    badge: "h-10 w-10",
    iconSize: 20,
  },
} as const;

export function EditableStudentPhoto({
  studentName,
  photoUrl,
  updatePhotoAction,
  size = "sm",
}: {
  studentName: string;
  photoUrl: string | null;
  updatePhotoAction: (formData: FormData) => void;
  size?: "sm" | "lg";
}) {
  const s = SIZE_CLASSES[size];

  return (
    <form action={updatePhotoAction} className={`relative shrink-0 ${s.wrapper}`}>
      <label
        className={`block cursor-pointer overflow-hidden rounded-pill bg-blue/10 ${s.wrapper}`}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={studentName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center font-heading font-semibold text-blue ${s.initials}`}
          >
            {initials(studentName)}
          </div>
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const input = event.currentTarget;
            await compressFileInput(input);
            input.form?.requestSubmit();
          }}
        />
      </label>
      <span
        className={`pointer-events-none absolute -bottom-1 -right-1 flex items-center justify-center rounded-pill bg-navy text-white shadow-card ${s.badge}`}
      >
        <CameraIcon size={s.iconSize} />
      </span>
    </form>
  );
}
