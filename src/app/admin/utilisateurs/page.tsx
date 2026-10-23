import { PageHeader } from "@/components/layout/page-header";
import { UsersTable } from "@/components/admin/users-table";
import { getUsers } from "@/lib/api";

export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Utilisateurs" description="Acheteurs, vendeurs et livreurs inscrits" />
      <UsersTable users={users} />
    </div>
  );
}
