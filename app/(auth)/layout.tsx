export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <section className="min-w-3xl max-w-5xl">{children}</section>
    </main>
  );
}
