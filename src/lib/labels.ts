import type { Role, User } from "@/lib/types";

export const roleLabel: Record<Role, string> = { buyer: "Acheteur", seller: "Vendeur", courier: "Livreur", admin: "Admin" };

export const userStatus: Record<User["status"], { label: string; tone: "success" | "danger" | "warning" }> = {
  active: { label: "Actif", tone: "success" },
  suspended: { label: "Suspendu", tone: "danger" },
  pending: { label: "En validation", tone: "warning" },
};
