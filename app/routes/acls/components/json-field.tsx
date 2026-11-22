import { useId } from "react";

export default function JsonField({
  label,
  description,
  value,
  onChange,
  invalid = false,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={`${id}-description`}
        aria-invalid={invalid}
        className="w-full rounded-md border p-3 font-mono text-sm"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        spellCheck={false}
        value={value}
      />
      <p className="text-xs opacity-70" id={`${id}-description`}>
        {description}
      </p>
    </div>
  );
}
