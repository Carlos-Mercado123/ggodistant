export type Section = "universidad" | "modalidad" | "carrera";
export type TagCategory = "cliente" | "objecion";

export type Tag = {
  id: number;
  category: TagCategory;
  label: string;
};

export type Card = {
  id: number;
  section: Section;
  careerId: number | null;
  title: string;
  concept: string;
  speech: string;
  links: string;
  position: number;
  tags: Tag[];
};

export type Career = {
  id: number;
  slug: string;
  name: string;
  position: number;
};
