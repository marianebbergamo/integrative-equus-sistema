interface PontoParada {
  latitude?: number | null;
  longitude?: number | null;
  logradouro?: string | null;
  numero?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

function pontoParaTexto(ponto: PontoParada) {
  if (ponto.latitude != null && ponto.longitude != null) {
    return `${ponto.latitude},${ponto.longitude}`;
  }
  return [ponto.logradouro, ponto.numero, ponto.cidade, ponto.uf]
    .filter(Boolean)
    .join(", ");
}

/**
 * Link de rota com várias paradas, na ordem da visita. Sem cálculo de
 * distância próprio: quem decide a rota é o próprio Google Maps
 * (ver "Pontos em aberto" do plano).
 */
export function linkRotaGoogleMaps(pontoPartida: string | null, paradas: PontoParada[]) {
  const destino = paradas.at(-1);
  if (!destino) return null;

  const params = new URLSearchParams({ api: "1", travelmode: "driving" });
  if (pontoPartida) params.set("origin", pontoPartida);
  params.set("destination", pontoParaTexto(destino));

  const waypoints = paradas.slice(0, -1).map(pontoParaTexto).filter(Boolean);
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
