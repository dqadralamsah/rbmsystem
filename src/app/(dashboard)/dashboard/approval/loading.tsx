import { Card, CardContent } from "@/components/ui/card";

export default function ApprovalLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="h-10 w-56 animate-pulse rounded-md bg-muted" />
      <Card className="rounded-md">
        <CardContent className="space-y-3 p-6">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </section>
  );
}
