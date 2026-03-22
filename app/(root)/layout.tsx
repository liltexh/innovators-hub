export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="flex-1">{children}</main>
    </div>
  );
}
