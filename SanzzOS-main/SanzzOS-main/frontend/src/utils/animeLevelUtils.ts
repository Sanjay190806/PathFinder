export interface AnimeRankInfo {
  narutoRank: string;
  demonSlayerRank: string;
  demonSlayerBreathing: string;
  narutoColor: string;
  demonSlayerColor: string;
}

export function getAnimeRankInfo(level: number): AnimeRankInfo {
  if (level <= 1) {
    return {
      narutoRank: 'Genin (Academy Graduate)',
      demonSlayerRank: 'Mizunoto (Rank 10)',
      demonSlayerBreathing: 'Water Breathing: First Style',
      narutoColor: '#F97316', // orange
      demonSlayerColor: '#3B82F6' // blue
    };
  } else if (level === 2) {
    return {
      narutoRank: 'Chunin (Journeyman)',
      demonSlayerRank: 'Kanoe (Rank 7)',
      demonSlayerBreathing: 'Thunder Breathing: First Style',
      narutoColor: '#10B981', // green
      demonSlayerColor: '#EAB308' // yellow
    };
  } else if (level === 3) {
    return {
      narutoRank: 'Special Jonin (Specialist)',
      demonSlayerRank: 'Hinoto (Rank 4)',
      demonSlayerBreathing: 'Beast Breathing: Third Style',
      narutoColor: '#8B5CF6', // purple
      demonSlayerColor: '#EC4899' // pink
    };
  } else if (level === 4) {
    return {
      narutoRank: 'Jonin (Elite Ninja)',
      demonSlayerRank: 'Kinoe (Rank 1)',
      demonSlayerBreathing: 'Flame Breathing: Second Style',
      narutoColor: '#EF4444', // red
      demonSlayerColor: '#F97316' // orange
    };
  } else {
    return {
      narutoRank: 'Hokage (Village Leader)',
      demonSlayerRank: 'Hashira (Pillar)',
      demonSlayerBreathing: 'Sun Breathing: Dance of the Fire God',
      narutoColor: '#EAB308', // gold
      demonSlayerColor: '#EF4444' // fire red
    };
  }
}
