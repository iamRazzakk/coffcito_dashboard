import { useEffect, useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";

interface CategoryFormProps {
  open: boolean;
  existing: string[];
  submitting?: boolean;
  onClose: () => void;
  onExited?: () => void;
  onSubmit: (name: string, imageFile: File | null) => void;
}

const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";

export default function CategoryForm({
  open,
  existing,
  submitting = false,
  onClose,
  onExited,
  onSubmit,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setImageFile(null);
      setImagePreview("");
      setError("");
    }
  }, [open]);

  const handleImage = (file?: File | null) => {
    if (!file) return;
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isJpeg = fileType === "image/jpeg" || fileType === "image/jpg" || /\.jpe?g$/.test(fileName);
    const isPng = fileType === "image/png" || fileName.endsWith(".png");
    if (!isJpeg && !isPng) {
      setImageFile(null);
      setImagePreview("");
      setError("Use a JPEG or PNG image");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (submitting) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }
    if (!imageFile) {
      setError("Image is required");
      return;
    }
    if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError("This category already exists");
      return;
    }
    onSubmit(trimmed, imageFile);
  };

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onExited={onExited}
      widthClass="max-w-[400px]"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">Add Category</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            New categories appear in product filters
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
            Category Image <span className="text-red-500">*</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(event) => handleImage(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleImage(event.dataTransfer.files?.[0]);
            }}
            className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex flex-col items-center justify-center gap-2 hover:border-[#1E90FF]/40 transition-colors"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : null}
            <CloudUpload className="w-7 h-7 text-gray-400 relative z-10" />
            <span className="text-[12px] text-gray-500 relative z-10">
              JPG or PNG
            </span>
            <span className="relative z-10 h-8 px-3 rounded-lg bg-white border border-gray-200 text-[12px] font-semibold text-gray-700 inline-flex items-center">
              Select Image
            </span>
          </button>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Seasonal"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {error ? (
            <p className="text-[12px] text-red-500 mt-1.5">{error}</p>
          ) : (
            <p className="text-[12px] text-gray-400 mt-1.5">
              Current: {existing.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !imageFile}
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Add Category"}
        </button>
      </div>
    </DrawerShell>
  );
}
