// composables/useOrg.ts
export const useOrg = () => {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();

  const currentOrg = useState("currentOrg", () => null);
  const loading = useState("orgLoading", () => false);

  const initOrg = async () => {
    if (!user.value) return;

    loading.value = true;
    try {
      console.log(user.value);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("current_org_id")
        .eq("id", user.value.sub)
        .single();

      if (profileError) throw profileError;
      if (!profile?.current_org_id) {
        console.warn("这人没组织！(可能触发器没跑成功)");
        return;
      }

      // 3. 拿着 ID 去查 organizations 表
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.current_org_id)
        .single();

      if (orgError) throw orgError;

      // 4. 存入状态
      currentOrg.value = org;
    } catch (e) {
      console.error("加载组织失败:", e.message);
    } finally {
      loading.value = false;
    }
  };

  return {
    currentOrg,
    loading,
    initOrg,
  };
};
