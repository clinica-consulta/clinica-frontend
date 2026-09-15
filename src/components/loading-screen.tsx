import logo from "@/assets/gestao-consultas-logo-transparent.png";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background" role="status" aria-label="Carregando página">
      <div className="flex flex-col items-center gap-5">
        <div className="loader-mark relative grid size-24 place-items-center">
          <span className="absolute inset-0 rounded-full border-[3px] border-border border-t-primary border-r-primary" />
          <img src={logo} alt="" className="size-14 object-contain" />
        </div>
        <p className="text-sm font-medium text-foreground">Carregando...</p>
      </div>
    </div>
  );
}
