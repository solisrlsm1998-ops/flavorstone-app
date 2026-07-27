import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function FormSection({ title, description, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-[24px] border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold text-gray-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {open ? <div className="space-y-4 border-t border-gray-100 px-5 py-5">{children}</div> : null}
    </section>
  );
}

export default FormSection;
