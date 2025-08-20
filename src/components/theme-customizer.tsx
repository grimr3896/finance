
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const colors = [
  { name: "Gold", primary: "45 96% 51%", accent: "347 77% 49%" },
  { name: "Blue", primary: "221 83% 53%", accent: "210 40% 96.1%" },
  { name: "Green", primary: "142 76% 36%", accent: "142 76% 26%" },
  { name: "Rose", primary: "347 90% 49%", accent: "347 77% 39%" },
  { name: "Violet", primary: "262 83% 58%", accent: "262 73% 48%" },
  { name: "Orange", primary: "25 95% 53%", accent: "25 85% 43%" },
];

export function ThemeCustomizer({ handleThemeChange }: { handleThemeChange: (theme: { primary: string; accent: string }) => void }) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const { toast } = useToast();

  const applyTheme = (color: typeof colors[0]) => {
    setSelectedColor(color);
    handleThemeChange({ primary: color.primary, accent: color.accent });
    toast({
        title: "Theme Updated",
        description: `Set theme to ${color.name}.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Theme Customization</CardTitle>
        <CardDescription>Select a color scheme for the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {colors.map((color) => (
            <div key={color.name} className="space-y-2">
              <Button
                variant="outline"
                className={cn(
                  "h-16 w-full justify-start p-2",
                  selectedColor.name === color.name && "border-2 border-primary"
                )}
                onClick={() => applyTheme(color)}
                style={{ backgroundColor: `hsl(${color.primary})` }}
              >
                {selectedColor.name === color.name && <Check className="mr-2 h-4 w-4 text-primary-foreground" />}
              </Button>
              <p className="text-center text-sm">{color.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
