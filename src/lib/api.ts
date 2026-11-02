/**
 * Data access layer. Every screen reads through these async functions, so
 * swapping the mock data for the real YA YO API only touches this file.
 */
import * as admin from "@/lib/data/admin";
import * as shopper from "@/lib/data/buyer";
import * as seller from "@/lib/data/seller";

export async function getSeller() {
  return seller.currentSeller;
}
export async function getSellerKpis() {
  return seller.sellerKpis;
}
export async function getSalesWeek() {
  return seller.salesWeek;
}
export async function getSellerOrders() {
  return seller.sellerOrders;
}
export async function getSellerOrder(id: string) {
  return seller.sellerOrders.find((o) => o.id === id) ?? null;
}
export async function getProducts() {
  return seller.products;
}
export async function getProduct(id: string) {
  return seller.products.find((p) => p.id === id) ?? null;
}
export async function getPosts() {
  return seller.posts;
}
export async function getPost(id: string) {
  return seller.posts.find((p) => p.id === id) ?? null;
}
export async function getComments(postId: string) {
  return seller.comments.filter((c) => c.postId === postId);
}
export async function getSellerNotifications() {
  return seller.sellerNotifications;
}
export async function getStories() {
  return seller.stories;
}
export async function getLives() {
  return seller.lives;
}
export async function getCollections() {
  return seller.collections;
}
export async function getContentAnalytics() {
  return seller.contentAnalytics;
}
export async function getPayouts() {
  return seller.payouts;
}

export async function getAdminKpis() {
  return admin.adminKpis;
}
export async function getWatchOrders() {
  return admin.watchOrders;
}
export async function getAllOrders() {
  return admin.allOrders;
}
export async function getTransactions() {
  return admin.transactions;
}
export async function getEscrowKpis() {
  return admin.escrowKpis;
}
export async function getDisputes() {
  return admin.disputes;
}
export async function getKycFiles() {
  return admin.kycFiles;
}
export async function getUsers() {
  return admin.users;
}
export async function getUser(id: string) {
  return admin.users.find((u) => u.id === id) ?? null;
}
export async function getCouriers() {
  return admin.couriers;
}
export async function getReportedComments() {
  return admin.reportedComments;
}
export async function getReports() {
  return { gmvMonths: admin.gmvMonths, ordersByStatus: admin.ordersByStatus, topSellers: admin.topSellers };
}
export async function getCommissionSettings() {
  return admin.commissionSettings;
}

/* ---------- Buyer app ---------- */

export async function getCatalog() {
  return shopper.catalog;
}
export async function getCatalogProduct(id: string) {
  return shopper.catalog.find((p) => p.id === id) ?? null;
}
export async function getShop(id: string) {
  return shopper.shops.find((s) => s.id === id) ?? null;
}
export async function getShops() {
  return shopper.shops;
}
export async function getCategories() {
  return shopper.categories;
}
export async function getBuyer() {
  return shopper.buyer;
}
export async function getBuyerOrders() {
  return shopper.buyerOrders;
}
export async function getBuyerOrder(id: string) {
  return shopper.buyerOrders.find((o) => o.id === id) ?? null;
}
export async function getBuyerDispute(id: string) {
  return shopper.buyerDisputes.find((d) => d.id === id) ?? null;
}
export async function getBuyerNotifications() {
  return shopper.buyerNotifications;
}
export async function getShopLives(shopId: string) {
  return shopper.shopLives[shopId] ?? [];
}
export async function getFeed() {
  return shopper.feedPosts;
}
export async function getFeedComments() {
  return shopper.feedComments;
}

/** Search on name, category and tags (accent-insensitive). */
export async function searchCatalog(q?: string) {
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const words = q ? norm(q).split(/\s+/).filter(Boolean) : [];
  return shopper.catalog.filter((p) => {
    if (!words.length) return true;
    const hay = norm([p.name, p.category, ...p.tags].join(" "));
    return words.every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")));
  });
}
