"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { deleteSessionCookie } from "@/lib/session";
import * as data from "@/lib/data";
import type { TagCategory } from "@/lib/types";

function refreshPanel() {
  revalidatePath("/panel", "layout");
}

export async function logoutAction() {
  await deleteSessionCookie();
  redirect("/login");
}

export async function createGenericCardAction(section: "universidad" | "modalidad") {
  await verifySession();
  data.createCard({
    section,
    careerId: null,
    title: "🆕 Nueva Propuesta Corporativa",
    concept: "Haz clic para editar la propuesta.",
    speech: "Speech comercial asignado.",
  });
  refreshPanel();
}

export async function createCareerSubcardAction(careerId: number) {
  await verifySession();
  data.createCard({
    section: "carrera",
    careerId,
    title: "🆕 Nueva Ficha Especial",
    concept: "Detalle técnico / Convenios.",
    speech: "Speech comercial específico.",
  });
  refreshPanel();
}

export async function updateCardFieldAction(
  cardId: number,
  field: "title" | "concept" | "speech" | "links",
  value: string
) {
  await verifySession();
  data.updateCardField(cardId, field, value.trim());
  refreshPanel();
}

export async function deleteCardAction(cardId: number) {
  await verifySession();
  data.deleteCard(cardId);
  refreshPanel();
}

export async function moveCardAction(cardId: number, direction: -1 | 1) {
  await verifySession();
  data.moveCard(cardId, direction);
  refreshPanel();
}

export async function addTagToCardAction(cardId: number, tagId: number) {
  await verifySession();
  data.addTagToCard(cardId, tagId);
  refreshPanel();
}

export async function removeTagFromCardAction(cardId: number, tagId: number) {
  await verifySession();
  data.removeTagFromCard(cardId, tagId);
  refreshPanel();
}

export async function createFilterTagAction(category: TagCategory, label: string) {
  await verifySession();
  if (!label.trim()) return;
  data.createFilterTag(category, label);
  refreshPanel();
}

export async function deleteFilterTagAction(id: number) {
  await verifySession();
  data.deleteFilterTag(id);
  refreshPanel();
}

export async function createCareerAction(name: string) {
  await verifySession();
  if (!name.trim()) return;
  const career = data.createCareer(name);
  revalidatePath("/panel", "layout");
  redirect(`/panel/carreras/${career.slug}`);
}

export async function renameCareerAction(careerId: number, name: string) {
  await verifySession();
  data.renameCareer(careerId, name);
  refreshPanel();
}

export async function deleteCareerAction(careerId: number) {
  await verifySession();
  data.deleteCareer(careerId);
  revalidatePath("/panel", "layout");
  redirect("/panel/carreras");
}
