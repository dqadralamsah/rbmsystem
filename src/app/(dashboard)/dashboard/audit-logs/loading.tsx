import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AuditLogsLoading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div>
        <div className="h-6 w-32 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-80 rounded-md bg-muted" />
      </div>
      <Card className="rounded-md">
        <CardHeader>
          <div className="h-5 w-20 rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="h-10 rounded-md bg-muted" key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-md">
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-12 rounded-md bg-muted" key={index} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
