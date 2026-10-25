/**
 * Data access layer. Every screen reads through these async functions, so
 * swapping the mock data for the real YA YO API only touches this file.
 * Each function checks the session and the role itself, as close to the data
 * as possible: a page or layout forgetting its guard still leaks nothing.
 */
import "server-only";
import { requireRole } from "@/lib/auth/server";
import * as admin from "@/lib/data/admin";
import * as seller from "@/lib/data/seller";

export async function getSeller() {
  await requireRole("seller");
  return seller.currentSeller;
}
export async function getSellerKpis() {
  await requireRole("seller");
  return seller.sellerKpis;
}
export async function getSalesWeek() {
  await requireRole("seller");
  return seller.salesWeek;
}
export async function getSellerOrders() {
  await requireRole("seller");
  return seller.sellerOrders;
}
export async function getSellerOrder(id: string) {
  await requireRole("seller");
  return seller.sellerOrders.find((o) => o.id === id) ?? null;
}
export async function getProducts() {
  await requireRole("seller");
  return seller.products;
}
export async function getProduct(id: string) {
  await requireRole("seller");
  return seller.products.find((p) => p.id === id) ?? null;
}
export async function getPosts() {
  await requireRole("seller");
  return seller.posts;
}
export async function getPost(id: string) {
  await requireRole("seller");
  return seller.posts.find((p) => p.id === id) ?? null;
}
export async function getComments(postId: string) {
  await requireRole("seller");
  return seller.comments.filter((c) => c.postId === postId);
}
export async function getSellerNotifications() {
  await requireRole("seller");
  return seller.sellerNotifications;
}
export async function getPayouts() {
  await requireRole("seller");
  return seller.payouts;
}

export async function getAdminKpis() {
  await requireRole("admin");
  return admin.adminKpis;
}
export async function getWatchOrders() {
  await requireRole("admin");
  return admin.watchOrders;
}
export async function getAllOrders() {
  await requireRole("admin");
  return admin.allOrders;
}
export async function getTransactions() {
  await requireRole("admin");
  return admin.transactions;
}
export async function getEscrowKpis() {
  await requireRole("admin");
  return admin.escrowKpis;
}
export async function getDisputes() {
  await requireRole("admin");
  return admin.disputes;
}
export async function getKycFiles() {
  await requireRole("admin");
  return admin.kycFiles;
}
export async function getUsers() {
  await requireRole("admin");
  return admin.users;
}
export async function getUser(id: string) {
  await requireRole("admin");
  return admin.users.find((u) => u.id === id) ?? null;
}
export async function getCouriers() {
  await requireRole("admin");
  return admin.couriers;
}
export async function getReportedComments() {
  await requireRole("admin");
  return admin.reportedComments;
}
export async function getReports() {
  await requireRole("admin");
  return { gmvMonths: admin.gmvMonths, ordersByStatus: admin.ordersByStatus, topSellers: admin.topSellers };
}
export async function getCommissionSettings() {
  await requireRole("admin");
  return admin.commissionSettings;
}
