import { Skeleton } from "antd";

export function StatCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-card"
        >
          <div className="mb-3 flex items-start justify-between">
            <Skeleton.Input active size="small" style={{ width: 96 }} />
            <Skeleton.Avatar active size={36} shape="square" />
          </div>
          <Skeleton.Input active size="large" style={{ width: 88, height: 32 }} />
          <Skeleton.Input
            active
            size="small"
            style={{ width: 72, marginTop: 12 }}
          />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ height }}
      role="status"
      aria-label="Loading chart"
    >
      <div
        className="flex h-full items-end gap-3 border-b border-l border-gray-200 px-4 pb-4"
      >
        {[45, 70, 52, 83, 64, 90, 76].map((barHeight, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-gray-100"
            style={{ height: `${barHeight}%` }}
          />
        ))}
      </div>
      <span className="sr-only">Loading chart data</span>
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 border-b border-gray-100 pb-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size="small"
            style={{ width: index === 0 ? 120 : 80 }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-gray-50 py-3 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              active
              paragraph={false}
              title={{ width: colIndex === 0 ? 180 : 72 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-card"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton.Input active size="small" style={{ width: 140 }} />
              <Skeleton.Input active size="large" style={{ width: 96 }} />
            </div>
            <Skeleton.Avatar active size={40} shape="square" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((__, row) => (
              <div key={row} className="flex justify-between gap-3">
                <Skeleton.Input active size="small" style={{ width: 88 }} />
                <Skeleton.Input active size="small" style={{ width: 112 }} />
              </div>
            ))}
          </div>
          <Skeleton.Button active block style={{ marginTop: 16, height: 36 }} />
        </div>
      ))}
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <Skeleton.Input active size="large" style={{ width: 180 }} />
        <Skeleton.Input active size="small" style={{ width: 280 }} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col items-center gap-3">
            <Skeleton.Avatar active size={96} />
            <Skeleton.Input active size="small" style={{ width: 140 }} />
            <Skeleton.Input active size="small" style={{ width: 180 }} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 20 }} />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} active paragraph={{ rows: 1 }} title={false} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton.Input active size="small" style={{ width: 140, marginBottom: 20 }} />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} active paragraph={{ rows: 1 }} title={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton.Input active size="small" style={{ width: 72 }} />

      <div className="space-y-2">
        <Skeleton.Input active size="small" style={{ width: 160 }} />
        <Skeleton.Input active size="large" style={{ width: 220 }} />
        <Skeleton.Input active size="small" style={{ width: 180 }} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <Skeleton.Avatar active size={56} />
              <div className="flex-1 space-y-2">
                <Skeleton.Input active size="small" style={{ width: 140 }} />
                <Skeleton.Input active size="small" style={{ width: 180 }} />
              </div>
            </div>
            <div className="space-y-3 pt-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} active paragraph={false} title={{ width: "100%" }} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <Skeleton.Input active size="small" style={{ width: 160, marginBottom: 20 }} />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, row) => (
                  <Skeleton key={row} active paragraph={false} title={{ width: "100%" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContentPageSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton.Input active size="small" style={{ width: 180 }} />
          <Skeleton.Input active size="small" style={{ width: 240 }} />
        </div>
        <Skeleton.Avatar active size={40} shape="square" />
      </div>
      <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} active paragraph={false} title={{ width: "100%" }} />
        ))}
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton.Input active size="small" style={{ width: 72 }} />
      <div className="space-y-2">
        <Skeleton.Input active size="small" style={{ width: 160 }} />
        <Skeleton.Input active size="large" style={{ width: 260 }} />
        <Skeleton.Input active size="small" style={{ width: 200 }} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton.Image active className="!w-full !h-72" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Skeleton.Avatar active size={48} />
            <div className="flex-1 space-y-2">
              <Skeleton.Input active size="small" style={{ width: 140 }} />
              <Skeleton.Input active size="small" style={{ width: 180 }} />
            </div>
          </div>
          <Skeleton.Button active block style={{ marginTop: 20, height: 36 }} />
        </div>
      </div>
    </div>
  );
}
