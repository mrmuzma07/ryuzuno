import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const users = [
    { email: "admin@ryuzuno.test", password: "admin123456", full_name: "Admin RyuZuno", role: "admin" },
    { email: "moderator@ryuzuno.test", password: "mod123456", full_name: "Moderator RyuZuno", role: "moderator" },
    { email: "teacher@ryuzuno.test", password: "teacher123456", full_name: "Guru RyuZuno", role: "teacher" },
    { email: "student@ryuzuno.test", password: "student123456", full_name: "Siswa RyuZuno", role: "student" },
  ];

  const results = [];

  for (const u of users) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((x: any) => x.email === u.email);

    let userId: string;

    if (found) {
      userId = found.id;
      results.push({ email: u.email, status: "already exists", id: userId });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (error) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }
      userId = data.user.id;
      results.push({ email: u.email, status: "created", id: userId });
    }

    // Ensure role exists (the trigger already assigns 'student', so add extra roles)
    if (u.role !== "student") {
      const { error: roleErr } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: u.role }, { onConflict: "user_id,role" });
      if (roleErr) {
        results.push({ email: u.email, role_status: "role_error", error: roleErr.message });
      }
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
