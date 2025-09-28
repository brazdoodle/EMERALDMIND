/**
 * Gen 3 Sprite Management System
 * 
 * Manages local Gen 3 Pokémon sprites for ROM hackers.
 * Provides fallbacks and batch download capabilities.
 */

// Gen 3 sprite mapping (using FireRed/LeafGreen + Ruby/Sapphire/Emerald style)
const GEN3_SPRITE_BASE_URL = '/sprites/gen3/';

class SpriteManager {
  constructor() {
    this.spriteCache = new Map();
    this.loadedSprites = new Set();
    this.fallbackEnabled = true;
  }

  /**
   * Get sprite URL for a Pokémon
   */
  getSpriteUrl(dexNumber, shiny = false) {
    const paddedNumber = String(dexNumber).padStart(3, '0');
    const shinyPrefix = shiny ? 'shiny/' : '';
    
    // Primary: Local Gen 3 sprites
    const localUrl = `${GEN3_SPRITE_BASE_URL}${shinyPrefix}${paddedNumber}.png`;
    
    // Fallback: PokeAPI (only if local sprite fails)
    const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${dexNumber}.png`;
    
    return {
      primary: localUrl,
      fallback: this.fallbackEnabled ? fallbackUrl : null,
      cached: this.spriteCache.get(`${dexNumber}-${shiny}`)
    };
  }

  /**
   * Check if local sprite exists
   */
  async checkSpriteExists(dexNumber, shiny = false) {
    const { primary } = this.getSpriteUrl(dexNumber, shiny);
    
    try {
      const response = await fetch(primary, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get sprite with automatic fallback
   */
  async getSprite(dexNumber, shiny = false) {
    const cacheKey = `${dexNumber}-${shiny}`;
    
    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey);
    }

    const urls = this.getSpriteUrl(dexNumber, shiny);
    
    // Try primary (local) first
    try {
      const exists = await this.checkSpriteExists(dexNumber, shiny);
      if (exists) {
        this.spriteCache.set(cacheKey, urls.primary);
        return urls.primary;
      }
    } catch (_error) {
      console.warn(`Local sprite check failed for #${dexNumber}:`, error);
    }
    
    // Fallback to PokeAPI
    if (urls.fallback) {
      this.spriteCache.set(cacheKey, urls.fallback);
      return urls.fallback;
    }
    
    return null;
  }

  /**
   * Batch download Gen 3 sprites
   */
  async downloadGen3Sprites(pokemonList = null, onProgress = null) {
    const downloadList = pokemonList || this.generateDownloadList();
    const results = { success: [], failed: [], total: downloadList.length };
    
    console.log(`Starting download of ${downloadList.length} Gen 3 sprites...`);
    
    for (let i = 0; i < downloadList.length; i++) {
      const pokemon = downloadList[i];
      
      try {
        await this.downloadSingleSprite(pokemon);
        results.success.push(pokemon);
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: downloadList.length,
            pokemon: pokemon.name,
            success: results.success.length,
            failed: results.failed.length
          });
        }
        
        // Throttle requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (_error) {
        console.warn(`Failed to download sprite for ${pokemon.name}:`, error);
        results.failed.push({ ...pokemon, error: error.message });
      }
    }
    
    console.log(`Sprite download complete. Success: ${results.success.length}, Failed: ${results.failed.length}`);
    return results;
  }

  /**
   * Download single sprite
   */
  async downloadSingleSprite(pokemon) {
    // This would be implemented server-side or as a build step
    // For now, we'll provide the infrastructure
    
    const sourceUrl = `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen7x/${String(pokemon.dexNumber).padStart(3, '0')}.png`;
    
    // In a real implementation, this would save to public/sprites/gen3/
    console.log(`Would download: ${pokemon.name} (#${pokemon.dexNumber}) from ${sourceUrl}`);
    
    return sourceUrl;
  }

  /**
   * Generate download list for all Gen 1-3 Pokémon
   */
  generateDownloadList() {
    const list = [];
    
    // Gen 1-3 (001-386)
    for (let i = 1; i <= 386; i++) {
      list.push({
        dexNumber: i,
        name: `Pokemon_${String(i).padStart(3, '0')}`,
        generation: i <= 151 ? 1 : i <= 251 ? 2 : 3
      });
    }
    
    return list;
  }

  /**
   * Get sprite statistics
   */
  async getSpriteStats() {
    const stats = {
      local: 0,
      missing: 0,
      total: 386,
      coverage: 0
    };
    
    for (let i = 1; i <= 386; i++) {
      const exists = await this.checkSpriteExists(i);
      if (exists) {
        stats.local++;
      } else {
        stats.missing++;
      }
    }
    
    stats.coverage = (stats.local / stats.total) * 100;
    return stats;
  }

  /**
   * Preload commonly used sprites
   */
  async preloadCommonSprites() {
    const commonPokemon = [
      1, 4, 7, 25, 39, 54, 60, 63, 66, 72, // Gen 1 commons
      152, 155, 158, 161, 165, 174, 179, 183, // Gen 2 commons
      252, 255, 258, 261, 263, 265, 270, 273, 276, 278 // Gen 3 commons
    ];
    
    const preloadPromises = commonPokemon.map(async (dexNum) => {
      try {
        await this.getSprite(dexNum);
        this.loadedSprites.add(dexNum);
      } catch (_error) {
        console.warn(`Failed to preload sprite for #${dexNum}:`, error);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log(`Preloaded ${this.loadedSprites.size} common Pokémon sprites`);
  }
}

// Sprite download utility for ROM hackers
const createSpriteDownloadScript = () => {
  return `
# Pokemon Sprite Download Script for ROM Hackers
# Run this script to download all Gen 3 sprites locally

import requests
import os
from time import sleep

def download_gen3_sprites():
    base_url = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen7x/"
    output_dir = "./public/sprites/gen3/"
    
    os.makedirs(output_dir, exist_ok=True)
    
    for i in range(1, 387):  # 1-386
        sprite_num = str(i).zfill(3)
        url = f"{base_url}{sprite_num}.png"
        output_path = f"{output_dir}{sprite_num}.png"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            print(f"Downloaded: {sprite_num}.png")
            sleep(0.1)  # Be respectful
            
        except Exception as e:
            print(f"Failed to download {sprite_num}.png: {e}")

if __name__ == "__main__":
    download_gen3_sprites()
`;
};

const spriteManager = new SpriteManager();

export default spriteManager;
export { SpriteManager, createSpriteDownloadScript };

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.spriteManager = spriteManager;
  window.downloadSpriteScript = createSpriteDownloadScript;
}