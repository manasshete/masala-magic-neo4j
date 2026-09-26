import Sidebar from "@/components/Sidebar";
import TopStrip from "@/components/TopStrip";
import AsciiBackground from "@/components/AsciiBackground";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen relative bg-[#08070b]">
      <AsciiBackground />
      <TopStrip />
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto relative">{children}</main>
      </div>
    </div>
  );
}
