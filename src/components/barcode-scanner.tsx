"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanBarcode, ArrowLeft } from "lucide-react";

// Mock barcode data for available drinks
const barcodeToDrinkId: { [key: string]: string } = {
  "6161101410202": "DRK001", // Tusker
  "6161100110103": "DRK002", // Guinness
  "6161100110301": "DRK003", // White Cap
  "0": "DRK004", // Draft Beer
  "1": "DRK005", // Drum
  "8712000030393": "DRK006", // Heineken
  "6161100110202": "DRK007", // Pilsner
};

export function BarcodeScanner() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API is not supported in this browser.");
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Unsupported Browser",
          description: "Your browser does not support the camera API.",
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings to use this app.",
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  const handleScan = () => {
    // In a real application, you would use a barcode scanning library (e.g., ZXing, Scandit)
    // to decode the video stream from the camera.
    // For this prototype, we'll simulate a scan with a random barcode.
    const barcodes = Object.keys(barcodeToDrinkId);
    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
    const drinkId = barcodeToDrinkId[randomBarcode];

    // Store the scanned drink ID in local storage to be picked up by the POS page
    localStorage.setItem("scannedDrinkId", drinkId);

    toast({
      title: "Item Scanned",
      description: `Added item with barcode ${randomBarcode} to cart.`,
    });
    
    // Redirect back to the POS page
    router.push("/pos");
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/pos')}>
                        <ArrowLeft />
                    </Button>
                    Barcode Scanner
                </CardTitle>
                <CardDescription>Point your camera at a barcode to add an item to the cart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                    <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-1/2 border-4 border-dashed border-primary/50 rounded-lg" />
                    </div>
                </div>

                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser settings to use the scanner.
                        </AlertDescription>
                    </Alert>
                )}
                
                <Button onClick={handleScan} className="w-full" size="lg" disabled={!hasCameraPermission}>
                    <ScanBarcode className="mr-2" /> Simulate Scan
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
