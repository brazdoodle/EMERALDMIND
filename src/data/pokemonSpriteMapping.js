// Automated sprite mapping for Pokemon
export const pokemonSpriteMapping = {
  1: "/sprites/BULBASAUR.png",
  2: "/sprites/IVYSAUR.png",
  3: "/sprites/VENUSAUR.png",
  4: "/sprites/CHARMANDER.png",
  5: "/sprites/CHARMELEON.png",
  6: "/sprites/CHARIZARD.png",
  7: "/sprites/SQUIRTLE.png",
  8: "/sprites/WARTORTLE.png",
  9: "/sprites/BLASTOISE.png",
  10: "/sprites/CATERPIE.png",
  11: "/sprites/METAPOD.png",
  12: "/sprites/BUTTERFREE.png",
  13: "/sprites/WEEDLE.png",
  14: "/sprites/KAKUNA.png",
  15: "/sprites/BEEDRILL.png",
  16: "/sprites/PIDGEY.png",
  17: "/sprites/PIDGEOTTO.png",
  18: "/sprites/PIDGEOT.png",
  19: "/sprites/RATTATA.png",
  20: "/sprites/RATICATE.png",
  21: "/sprites/SPEAROW.png",
  22: "/sprites/FEAROW.png",
  23: "/sprites/EKANS.png",
  24: "/sprites/ARBOK.png",
  25: "/sprites/PIKACHU.png",
  26: "/sprites/RAICHU.png",
  27: "/sprites/SANDSHREW.png",
  28: "/sprites/SANDSLASH.png",
  29: "/sprites/NIDORANfE.png",
  30: "/sprites/NIDORINA.png",
  31: "/sprites/NIDOQUEEN.png",
  252: "/sprites/TREECKO.png",
  253: "/sprites/GROVYLE.png",
  254: "/sprites/SCEPTILE.png",
  280: "/sprites/RALTS.png",
  281: "/sprites/KIRLIA.png",
  282: "/sprites/GARDEVOIR.png"
};

// Function to get sprite path for a Pokemon
export function getPokemonSprite(dexNumber) {
  return pokemonSpriteMapping[dexNumber] || '/sprites/000.png'; // Default fallback
}
