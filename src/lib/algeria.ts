export interface CheckoutCommune {
  name: string;
  nameAr: string;
}

export interface CheckoutWilaya {
  code: number;
  name: string;
  nameAr: string;
  communes: CheckoutCommune[];
}

interface RepositoryCommune {
  arabic: string;
  ascii: string;
}

interface RepositoryWilaya {
  code: number;
  arabic: string;
  ascii: string;
  communes: RepositoryCommune[];
}

/**
 * Dataset:
 * https://github.com/islam-re/Algeria-wilayas
 *
 * 69 wilayas + 1541 communes, based on Loi 26-06 / JO n°25 (2026).
 * The data is fetched server-side and cached by Next.js.
 */
const ALGERIA_DATA_URL =
  "https://raw.githubusercontent.com/islam-re/Algeria-wilayas/main/json/wilaya-commune/wilaya-commune.json";

export async function getAlgeriaLocations(): Promise<CheckoutWilaya[]> {
  try {
    const response = await fetch(ALGERIA_DATA_URL, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      throw new Error(`Impossible de charger les wilayas (${response.status})`);
    }

    const data = (await response.json()) as RepositoryWilaya[];

    return data
      .map((wilaya) => ({
        code: wilaya.code,
        name: wilaya.ascii,
        nameAr: wilaya.arabic,
        communes: [...wilaya.communes]
          .map((commune) => ({
            name: commune.ascii,
            nameAr: commune.arabic,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "fr")),
      }))
      .sort((a, b) => a.code - b.code);
  } catch (error) {
    console.error("[Michket] Erreur chargement wilayas/communes:", error);
    return [];
  }
}
