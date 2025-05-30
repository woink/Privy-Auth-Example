import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ShadcnExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }, 2000);
  };

  return (
    <Card className="w-96 m-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          shadcn/ui Components
          <Badge variant="secondary">Demo</Badge>
        </CardTitle>
        <CardDescription>
          Example of various shadcn/ui components working together
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAlert && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your form has been submitted successfully.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="example-input">Example Input</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                id="example-input"
                placeholder="Type something here..."
                disabled={isLoading}
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit"}
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="button" variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </form>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>
            This demonstrates shadcn/ui components with Tailwind CSS v4.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
