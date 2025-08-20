"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { predictiveSalesForecasting, type PredictiveSalesForecastingOutput } from "@/ai/flows/predictive-sales-forecasting";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, Loader2, BarChart } from "lucide-react";

const formSchema = z.object({
  historicalSalesData: z.string().min(10, {
    message: "Please provide more detailed historical sales data.",
  }),
  horizonDays: z.coerce.number().int().positive().default(14),
});

// Helper to parse CSV data from textarea
const parseSalesData = (csv: string) => {
  try {
    const lines = csv.trim().split("\n");
    const header = lines.shift()?.toLowerCase().split(",");
    if (!header || !header.includes("date") || !header.includes("total")) {
        return [];
    }
    const dateIndex = header.indexOf("date");
    const totalIndex = header.indexOf("total");
    
    return lines.map(line => {
        const values = line.split(",");
        return {
            date: values[dateIndex].trim(),
            total: parseInt(values[totalIndex].trim(), 10)
        }
    }).filter(record => record.date && !isNaN(record.total));
  } catch (e) {
    console.error("Failed to parse sales data", e);
    return [];
  }
}

export function ForecastingForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictiveSalesForecastingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalSalesData: "date,total\n" + Array.from({ length: 20 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i -1);
        const total = Math.floor(Math.random() * 50000) + 20000;
        return `${d.toISOString().slice(0, 10)},${total}`;
      }).join("\n"),
      horizonDays: 14,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    const sales = parseSalesData(values.historicalSalesData);

    try {
      const forecastResult = await predictiveSalesForecasting({
        sales,
        horizonDays: values.horizonDays,
      });

      if (forecastResult.ok) {
        setResult(forecastResult);
      } else {
        setError(forecastResult.message || "An unknown error occurred.");
      }

    } catch (e) {
      setError("An unexpected network or server error occurred. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Predictive Sales Forecasting</CardTitle>
          <CardDescription>Use AI to forecast sales and optimize stock levels.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="historicalSalesData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Sales Data (date,total)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 2024-08-01,50000..."
                        className="h-48 font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="horizonDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast Horizon (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 14" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                Generate Forecast
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold">Forecast Results</h3>
        {loading && (
            <div className="flex items-center justify-center rounded-lg border p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating forecast...</p>
            </div>
        )}
        {error && (
            <Alert variant="destructive">
              <AlertTitle>Forecast Failed</AlertTitle>
              <AlertDescription>
                <p>{error}</p>
                 <ul className="mt-2 list-disc pl-5 text-xs">
                    <li>Ensure dates are in YYYY-MM-DD format.</li>
                    <li>Provide at least 14 days of sales for best results.</li>
                    <li>Totals must be whole numbers (e.g., 50000).</li>
                  </ul>
              </AlertDescription>
            </Alert>
        )}
        {result && (
          <Card>
            <CardHeader>
                <CardTitle>Sales Forecast</CardTitle>
                <CardDescription>
                    Method: <span className="font-semibold text-primary">{result.method}</span> 
                    {result.usedFallback && <span className="text-muted-foreground"> (fallback)</span>}
                </CardDescription>
            </CardHeader>
            <CardContent>
               {result.message && <p className="text-sm text-muted-foreground mb-4">{result.message}</p>}
                <div className="space-y-2">
                {result.forecast?.map(f => (
                    <div key={f.date} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
                        <span className="font-mono">{f.date}</span>
                        <span className="font-semibold text-primary">Ksh {f.total.toLocaleString()}</span>
                    </div>
                ))}
                </div>
            </CardContent>
          </Card>
        )}
        {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BarChart className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your sales forecast will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
