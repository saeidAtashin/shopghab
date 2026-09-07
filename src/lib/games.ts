export type Game = {
  id: string;
  title: string;
  console: "ps5" | "ps4" | "xbox";
  price: number;
  image: string;
};

export const games: Game[] = [
  {
    id: "gow-ragnarok",
    title: "God Of War Ragnarok",
    console: "ps5",
    price: 120,
    image: "/games/gow.jpg",
  },
  {
    id: "spiderman2",
    title: "Spider-Man 2",
    console: "ps5",
    price: 110,
    image: "/games/spiderman2.jpg",
  },
  {
    id: "fifa24",
    title: "EA Sports FC 24",
    console: "ps5",
    price: 90,
    image: "/games/fifa24.jpg",
  },
  {
    id: "lastofus2",
    title: "Last Of Us Part II",
    console: "ps4",
    price: 80,
    image: "/games/tlou2.jpg",
  },
  {
    id: "halo",
    title: "Halo Infinite",
    console: "xbox",
    price: 95,
    image: "/games/halo.jpg",
  },
];
