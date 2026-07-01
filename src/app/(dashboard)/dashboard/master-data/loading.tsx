import { Card, CardContent } from "@/components/ui/card";

export default function MasterDataLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card className="rounded-md" key={index}>
            <CardContent className="h-28 animate-pulse bg-muted" />
          </Card>
        ))}
      </div>
    </section>
  );
}
