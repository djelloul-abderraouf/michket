import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-[#2A1B16] text-white">
      <Link
        href="/lampes-3d"
        className="mx-auto flex h-10 max-w-[1100px] items-center justify-center gap-2 px-4 text-[12px] font-medium sm:gap-3 sm:text-[13px]"
      >
        <span className="rounded-full bg-[#ECAB1C] px-2 py-0.5 text-[11px] font-extrabold text-[#251713]">
          Promo
        </span>
        <span>Réduction en cours sur une sélection de modèles</span>
        <span className="hidden text-white/55 sm:inline">Voir les lampes</span>
      </Link>
    </div>
  );
}
