import * as React from "react";
import { cn } from "cn";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [tabValue, setTabValue] = React.useState(defaultValue || "");
  const currentValue = value !== undefined ? value : tabValue;

  const handleValueChange = (val: string) => {
    if (value === undefined) {
      setTabValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange }}
    >
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center justify-start gap-1 rounded-2xl bg-[#0C0D12] border border-white/10 p-1.5 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className,
  children,
  ...props
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      type="button"
      role="tab"
      value={value}
      data-value={value}
      aria-selected={isActive}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-heading font-medium transition-all cursor-pointer focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-[#FF5500] text-white font-bold shadow-[0_0_20px_rgba(255,85,0,0.35)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({
  value,
  className,
  children,
  ...props
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-5 focus-visible:outline-none animate-in fade-in duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
