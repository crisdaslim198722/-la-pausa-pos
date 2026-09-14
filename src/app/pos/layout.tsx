import { POSCartProvider } from "@/features/pos/components/POSCartContext";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return <POSCartProvider>{children}</POSCartProvider>;
}
