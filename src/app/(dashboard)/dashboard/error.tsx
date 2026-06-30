"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-base">Dashboard unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The workspace could not be loaded. Please try again.
          </p>
          <Button className="mt-4" onClick={reset} type="button">
            Retry
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
