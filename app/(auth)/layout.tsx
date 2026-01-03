export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <section className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl">
        {children}
      </section>
    </main>
  );
}
