import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="h-28 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card className="rounded-md" key={index}>
            <CardContent className="p-5">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-36 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-md bg-muted" />
        <div className="h-72 animate-pulse rounded-md bg-muted" />
      </div>
    </section>
  );
}
