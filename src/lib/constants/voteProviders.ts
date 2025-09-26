export interface VoteProviderInfo {
  id: string;
  type: 'serversmc' | 'minecraftlist' | 'topg' | 'minecraftservers';
  name: string;
  description: string;
  image: string;
  websiteUrl: string;
  cooldownHours: number;
}

export const VOTE_PROVIDERS: Record<string, VoteProviderInfo> = {
  serversmc: {
    id: 'serversmc',
    type: 'serversmc',
    name: 'ServersMC',
    description: 'Minecraft sunucu listelerinde en popüler platformlardan biri',
    image: '/images/vote-providers/smc.webp',
    websiteUrl: 'https://www.servers-mc.net',
    cooldownHours: 24,
  },
  minecraftlist: {
    id: 'minecraftlist',
    type: 'minecraftlist',
    name: 'MinecraftList',
    description: 'Güvenilir Minecraft sunucu listesi platformu',
    image: '/images/vote-providers/minecraftlist.png',
    websiteUrl: 'https://minecraftlist.org',
    cooldownHours: 24,
  },
  topg: {
    id: 'topg',
    type: 'topg',
    name: 'TopG',
    description: 'Türkiye\'nin en büyük oyun sunucu listesi',
    image: '/images/vote-providers/topg.png',
    websiteUrl: 'https://topg.org',
    cooldownHours: 24,
  },
  minecraftservers: {
    id: 'minecraftservers',
    type: 'minecraftservers',
    name: 'MinecraftServers',
    description: 'Dünya çapında Minecraft sunucu listesi',
    image: '/images/vote-providers/minecraftservers.png',
    websiteUrl: 'https://minecraftservers.org',
    cooldownHours: 24,
  },
};

export const getVoteProviderInfo = (type: string): VoteProviderInfo | undefined => {
  return VOTE_PROVIDERS[type];
};

export const getAllVoteProviders = (): VoteProviderInfo[] => {
  return Object.values(VOTE_PROVIDERS);
};
