export function PageWithBackground({ children }) {
  return (
    <div className="relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/Fondo(IA).png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="bg-white/20 px-6 py-6">
        {children}
      </div>
    </div>
  );
}