import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getConfig(key: string): Promise<string | null> {
  const { data } = await admin.from("app_config").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

async function callTelegram(method: string, payload: unknown) {
  const botToken = await getConfig("telegram_bot_token");
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("ok");

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response("ok");
  }

  const message = update.message;
  if (message?.text?.startsWith("/start")) {
    const appUrl = await getConfig("mini_app_url");
    await callTelegram("sendMessage", {
      chat_id: message.chat.id,
      text: "💻 DIBO Computers — Namangan\n\nNoutbuklarni ko'rish, taqqoslash, o'zingiznikini sotish va AI yordamida tanlash uchun quyidagi tugmani bosing 👇",
      reply_markup: {
        inline_keyboard: [[{ text: "🛒 Do'konni ochish", web_app: { url: appUrl } }]],
      },
    });
  }

  return new Response("ok");
});
