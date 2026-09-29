export default function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-[#1E90FF]/25 border-t-[#1E90FF] animate-spin" />
        <div className="text-[12px] text-gray-400 font-medium">Loading...</div>
      </div>
    </div>
  );
}
