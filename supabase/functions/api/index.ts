import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function hmacSha256(keyBytes: Uint8Array | string, message: string): Promise<Uint8Array> {
  const keyData = typeof keyBytes === "string" ? new TextEncoder().encode(keyBytes) : keyBytes;
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getConfig(key: string): Promise<string | null> {
  const { data } = await admin.from("app_config").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

async function verifyInitData(initData: string): Promise<{ user: TgUser } | null> {
  if (!initData) return null;
  const botToken = await getConfig("telegram_bot_token");
  if (!botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const pairs: string[] = [];
  for (const [key, value] of [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    pairs.push(`${key}=${value}`);
  }
  const dataCheckString = pairs.join("\n");

  const secretKey = await hmacSha256("WebAppData", botToken);
  const computedHash = bytesToHex(await hmacSha256(secretKey, dataCheckString));

  if (computedHash !== hash) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  const ageSeconds = Date.now() / 1000 - authDate;
  if (!authDate || ageSeconds > 60 * 60 * 24) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  const user = JSON.parse(userRaw) as TgUser;
  return { user };
}

async function isAdmin(telegramId: number): Promise<boolean> {
  const raw = await getConfig("admin_telegram_ids");
  if (!raw) return false;
  return raw.split(",").map((s) => s.trim()).includes(String(telegramId));
}

async function upsertUser(user: TgUser) {
  await admin.from("app_users").upsert({
    telegram_id: user.id,
    username: user.username ?? null,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
    photo_url: user.photo_url ?? null,
    last_seen_at: new Date().toISOString(),
  });
}

async function requireAuth(body: any): Promise<{ user: TgUser; admin: boolean } | null> {
  const verified = await verifyInitData(body.initData);
  if (!verified) return null;
  await upsertUser(verified.user);
  const adminFlag = await isAdmin(verified.user.id);
  return { user: verified.user, admin: adminFlag };
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) throw new Error("invalid data url");
  const contentType = match[1];
  const b64 = match[2];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const action = body.action as string;

  try {
    switch (action) {
      case "auth": {
        const verified = await verifyInitData(body.initData);
        if (!verified) return json({ error: "unauthorized" }, 401);
        await upsertUser(verified.user);
        const adminFlag = await isAdmin(verified.user.id);
        return json({ user: verified.user, isAdmin: adminFlag });
      }

      case "uploadImage": {
        const auth = await requireAuth(body);
        if (!auth) return json({ error: "unauthorized" }, 401);
        const { bytes, contentType } = dataUrlToBytes(body.dataUrl);
        const ext = contentType.split("/")[1] ?? "jpg";
        const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await admin.storage.from("product-images").upload(path, bytes, { contentType });
        if (error) return json({ error: error.message }, 500);
        const { data } = admin.storage.from("product-images").getPublicUrl(path);
        return json({ url: data.publicUrl });
      }

      case "createListing": {
        const auth = await requireAuth(body);
        if (!auth) return json({ error: "unauthorized" }, 401);
        const p = body.product ?? {};
        const { data, error } = await admin.from("products").insert({
          title: p.title,
          brand: p.brand ?? null,
          cpu: p.cpu ?? null,
          ram_gb: p.ram_gb ?? null,
          storage: p.storage ?? null,
          gpu: p.gpu ?? null,
          screen_size: p.screen_size ?? null,
          condition: "used",
          price: p.price,
          currency: p.currency ?? "UZS",
          images: p.images ?? [],
          description: p.description ?? null,
          category: p.category ?? "other",
          tags: p.tags ?? [],
          source: "user_listing",
          seller_telegram_id: auth.user.id,
          seller_contact: p.seller_contact ?? auth.user.username ?? null,
          status: "pending",
        }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ product: data });
      }

      case "myProfile": {
        const auth = await requireAuth(body);
        if (!auth) return json({ error: "unauthorized" }, 401);
        const { data: listings } = await admin.from("products").select("*").eq("seller_telegram_id", auth.user.id).order("created_at", { ascending: false });
        const { data: favRows } = await admin.from("favorites").select("product_id").eq("telegram_id", auth.user.id);
        const favIds = (favRows ?? []).map((r) => r.product_id);
        let favorites: any[] = [];
        if (favIds.length) {
          const { data: favProducts } = await admin.from("products").select("*").in("id", favIds);
          favorites = favProducts ?? [];
        }
        return json({ user: auth.user, isAdmin: auth.admin, listings: listings ?? [], favorites });
      }

      case "toggleFavorite": {
        const auth = await requireAuth(body);
        if (!auth) return json({ error: "unauthorized" }, 401);
        const productId = body.productId;
        const { data: existing } = await admin.from("favorites").select("*").eq("telegram_id", auth.user.id).eq("product_id", productId).maybeSingle();
        if (existing) {
          await admin.from("favorites").delete().eq("telegram_id", auth.user.id).eq("product_id", productId);
          return json({ favorited: false });
        } else {
          await admin.from("favorites").insert({ telegram_id: auth.user.id, product_id: productId });
          return json({ favorited: true });
        }
      }

      case "submitQuiz": {
        const verified = await verifyInitData(body.initData).catch(() => null);
        const telegramId = verified?.user?.id ?? null;
        if (verified) await upsertUser(verified.user);
        const recommendedId = body.recommendedProductId ?? null;
        await admin.from("quiz_submissions").insert({
          telegram_id: telegramId,
          answers: body.answers ?? {},
          recommended_product_id: recommendedId,
        });
        return json({ ok: true });
      }

      case "adminListPending": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const { data } = await admin.from("products").select("*").eq("status", "pending").order("created_at", { ascending: false });
        return json({ products: data ?? [] });
      }

      case "adminModerateListing": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const { error } = await admin.from("products").update({ status: body.status, updated_at: new Date().toISOString() }).eq("id", body.productId);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }

      case "adminUpsertProduct": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const p = body.product ?? {};
        const row = {
          title: p.title,
          brand: p.brand ?? null,
          cpu: p.cpu ?? null,
          ram_gb: p.ram_gb ?? null,
          storage: p.storage ?? null,
          gpu: p.gpu ?? null,
          screen_size: p.screen_size ?? null,
          condition: p.condition ?? "new",
          price: p.price,
          currency: p.currency ?? "UZS",
          images: p.images ?? [],
          description: p.description ?? null,
          category: p.category ?? "other",
          tags: p.tags ?? [],
          in_stock: p.in_stock ?? true,
          source: "shop",
          status: "approved",
          updated_at: new Date().toISOString(),
        };
        if (p.id) {
          const { data, error } = await admin.from("products").update(row).eq("id", p.id).select().single();
          if (error) return json({ error: error.message }, 500);
          return json({ product: data });
        } else {
          const { data, error } = await admin.from("products").insert(row).select().single();
          if (error) return json({ error: error.message }, 500);
          return json({ product: data });
        }
      }

      case "adminDeleteProduct": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const { error } = await admin.from("products").delete().eq("id", body.productId);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }

      case "adminUpsertBanner": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const b = body.banner ?? {};
        const row = {
          image_url: b.image_url,
          title: b.title ?? null,
          subtitle: b.subtitle ?? null,
          link_url: b.link_url ?? null,
          is_active: b.is_active ?? true,
          sort_order: b.sort_order ?? 0,
        };
        if (b.id) {
          const { data, error } = await admin.from("banners").update(row).eq("id", b.id).select().single();
          if (error) return json({ error: error.message }, 500);
          return json({ banner: data });
        } else {
          const { data, error } = await admin.from("banners").insert(row).select().single();
          if (error) return json({ error: error.message }, 500);
          return json({ banner: data });
        }
      }

      case "adminDeleteBanner": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const { error } = await admin.from("banners").delete().eq("id", body.bannerId);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }

      case "adminListBanners": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const { data } = await admin.from("banners").select("*").order("sort_order", { ascending: true });
        return json({ banners: data ?? [] });
      }

      case "adminStats": {
        const auth = await requireAuth(body);
        if (!auth?.admin) return json({ error: "forbidden" }, 403);
        const { count: usersCount } = await admin.from("app_users").select("*", { count: "exact", head: true });
        const { count: productsCount } = await admin.from("products").select("*", { count: "exact", head: true }).eq("status", "approved");
        const { count: pendingCount } = await admin.from("products").select("*", { count: "exact", head: true }).eq("status", "pending");
        const { count: quizCount } = await admin.from("quiz_submissions").select("*", { count: "exact", head: true });
        return json({ usersCount, productsCount, pendingCount, quizCount });
      }

      default:
        return json({ error: "unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
