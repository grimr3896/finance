"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { detectStockAnomaly, type DetectStockAnomalyOutput } from "@/ai/flows/anomaly-detection";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ShieldAlert, Loader2, Terminal, ShieldCheck } from "lucide-react";

const formSchema = z.object({
  drinkName: z.string().min(2, { message: "Drink name is required." }),
  expectedStockLevel: z.coerce.number().min(0, { message: "Expected stock cannot be negative." }),
  actualStockLevel: z.coerce.number().min(0, { message: "Actual stock cannot be negative." }),
  salesData: z.string().min(10, { message: "Sales data is required." }),
  expensesData: z.string().min(10, { message: "Expenses data is required." }),
});

export function AnomalyForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectStockAnomalyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drinkName: "Tusker",
      expectedStockLevel: 50,
      actualStockLevel: 45,
      salesData: "Last 24 hours: 24 bottles sold.",
      expensesData: "Last delivery: 5 crates (120 bottles) on 2024-08-15.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const anomalyResult = await detectStockAnomaly(values);
      setResult(anomalyResult);
    } catch (e) {
      setError("An error occurred while checking for anomalies. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Stock Anomaly Detection</CardTitle>
          <CardDescription>Identify discrepancies in stock levels using AI.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="drinkName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drink Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="expectedStockLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Stock</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="actualStockLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Stock</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={form.control} name="salesData" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Data</FormLabel>
                    <FormControl><Textarea className="h-24" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="expensesData" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expenses/Delivery Data</FormLabel>
                    <FormControl><Textarea className="h-24" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                Check for Anomaly
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold">Detection Results</h3>
        {loading && (
             <div className="flex items-center justify-center rounded-lg border p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Analyzing data...</p>
            </div>
        )}
        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {result && (
          <Alert variant={result.isAnomaly ? "destructive" : "default"} className={!result.isAnomaly ? "border-green-500/50 text-green-500" : ""}>
            {result.isAnomaly ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-green-500" />}
            <AlertTitle>{result.isAnomaly ? "Anomaly Detected!" : "No Anomaly Detected"}</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
                <div>
                    <h4 className="font-semibold mb-1">Explanation:</h4>
                    <p className={result.isAnomaly ? "" : "text-foreground"}>{result.anomalyExplanation}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-1">Recommended Actions:</h4>
                    <p className={result.isAnomaly ? "" : "text-foreground"}>{result.recommendedActions}</p>
                </div>
            </AlertDescription>
          </Alert>
        )}
        {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Terminal className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your anomaly detection results will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
