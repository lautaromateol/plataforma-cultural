import { Header } from "./components/header";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="bg-slate-50 h-full">
                {children}
            </div>
        </main>
    )
}