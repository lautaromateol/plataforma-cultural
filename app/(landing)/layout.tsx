import { Header } from "./components/header";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen">
            <Header />
            {children}
        </main>
    )
}