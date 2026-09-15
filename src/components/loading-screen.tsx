import logoAsset from "@/assets/gestao-consultas-logo.png.asset.json";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 backdrop-blur-sm" role="status" aria-label="Carregando página">
      <div className="flex flex-col items-center gap-5">
        <div className="loader-mark relative grid size-24 place-items-center rounded-full bg-card shadow-xl">
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-info" />
          <img src={logoAsset.url} alt="" className="size-14 object-contain" />
        </div>
        <div className="text-center">
          <p className="font-display text-xl uppercase text-primary">Gestão de Consultas</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Organizando seu atendimento...</p>
        </div>
        <div className="h-1 w-36 overflow-hidden rounded-full bg-muted"><div className="loading-bar h-full rounded-full bg-primary" /></div>
      </div>
    </div>
  );
}
