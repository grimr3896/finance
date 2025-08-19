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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BrainCircuit, Loader2 } from "lucide-react";

const formSchema = z.object({
  historicalSalesData: z.string().min(10, {
    message: "Please provide more detailed historical sales data.",
  }),
  timeframe: z.string().min(3, {
    message: "Please specify a timeframe (e.g., 'next month').",
  }),
  currentStockLevels: z.string().min(5, {
    message: "Please provide current stock levels.",
  }),
});

export function ForecastingForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictiveSalesForecastingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalSalesData: "Product,Date,UnitsSold\nTusker,2024-08-01,50\nTusker,2024-08-02,75\nGuinness,2024-08-01,30\nGuinness,2024-08-02,45",
      timeframe: "next week",
      currentStockLevels: "Tusker: 48 bottles\nGuinness: 36 bottles\nDraft Beer Drum: 35000 ml",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const forecastResult = await predictiveSalesForecasting(values);
      setResult(forecastResult);
    } catch (e) {
      setError("An error occurred while generating the forecast. Please try again.");
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
                    <FormLabel>Historical Sales Data (CSV format)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Product,Date,UnitsSold..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentStockLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock Levels</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Tusker: 48 bottles"
                        className="h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast Timeframe</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., next week, next month" {...field} />
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
        {error && <Card className="border-destructive"><CardContent className="p-4"><p className="text-destructive">{error}</p></CardContent></Card>}
        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.salesForecast}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Stock Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{result.stockRecommendations}</p>
              </CardContent>
            </Card>
          </div>
        )}
        {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <BrainCircuit className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Your AI-powered forecast will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
