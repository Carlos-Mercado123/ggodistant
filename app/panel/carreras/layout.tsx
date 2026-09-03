import { getCareers } from "@/lib/data";
import CareersSidebar from "@/components/panel/CareersSidebar";

export default function CarrerasLayout({ children }: { children: React.ReactNode }) {
  const careers = getCareers();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
      <CareersSidebar careers={careers} />
      <div>{children}</div>
    </div>
  );
}
