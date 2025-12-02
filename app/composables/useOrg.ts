import type { Database } from '~/types/database.types'

// 定义成员数据的类型，方便前端使用
type OrgMember = {
  id: string
  role: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
    email: string | null
  } | null
}

export const useOrg = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  const currentOrg = useState<any | null>('currentOrg', () => null)
  const myOrgs = useState<any[]>('myOrgs', () => [])
  const orgMembers = useState<OrgMember[]>('orgMembers', () => [])
  const loading = useState<boolean>('orgLoading', () => false)

  const initOrg = async () => {
    const userId = user.value?.sub || user.value?.id
    if (!userId) return

    loading.value = true
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_org_id')
        .eq('id', userId)
        .single()

      const targetOrgId = profile?.current_org_id

      if (targetOrgId) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', targetOrgId)
          .single()

        if (org) currentOrg.value = org
      }

      await fetchMyOrgs()

      if (currentOrg.value) {
        await fetchMembers()
      }
    } catch (e: any) {
      console.error('加载组织失败:', e.message)
    } finally {
      loading.value = false
    }
  }

  const fetchMyOrgs = async () => {
    const userId = user.value?.sub || user.value?.id
    if (!userId) return

    const { data } = await supabase
      .from('organizations')
      .select('*, organization_members!inner(user_id)')
      .eq('organization_members.user_id', userId)
      .order('created_at', { ascending: false })

    myOrgs.value = data || []
  }

  const switchOrg = async (orgId: string) => {
    const userId = user.value?.sub || user.value?.id
    if (!userId) {
      console.error('切换组织失败: 无法获取用户 ID')
      return
    }

    const targetOrg = myOrgs.value.find((o) => o.id === orgId)

    if (targetOrg) {
      currentOrg.value = targetOrg

      const { error } = await supabase
        .from('profiles')
        .update({ current_org_id: orgId })
        .eq('id', userId)

      if (error) {
        console.error('保存组织偏好失败:', error.message)
      } else {
        console.log('组织偏好已保存:', targetOrg.name)
      }

      await fetchMembers()
    }
  }

  const createOrg = async (name: string) => {
    const userId = user.value?.sub || user.value?.id
    if (!userId) return false

    try {
      // A. 插入组织表
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, owner_id: userId, is_personal: false })
        .select()
        .single()

      if (orgError) throw orgError

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({ organization_id: newOrg.id, user_id: userId, role: 'owner' })

      if (memberError) throw memberError

      await fetchMyOrgs()
      await switchOrg(newOrg.id)
      return true
    } catch (e: any) {
      alert('创建失败: ' + e.message)
      return false
    }
  }

  const fetchMembers = async () => {
    if (!currentOrg.value?.id) return

    const { data } = await supabase
      .from('organization_members')
      .select('id, role, profiles(full_name, avatar_url, email)')
      .eq('organization_id', currentOrg.value.id)

    // @ts-ignore: Supabase 类型联表推导有时不准确，这里忽略 TS 检查
    orgMembers.value = data || []
  }

  const inviteMember = async (email: string) => {
    if (!currentOrg.value?.id) return { success: false, msg: '未选中组织' }

    if (currentOrg.value.is_personal) {
      return { success: false, msg: '个人组织无法邀请成员，请先创建新组织（如：XX饭店）。' }
    }

    const { data: foundUser, error: findError } = await supabase.rpc('get_profile_by_email', {
      email_input: email
    })

    if (findError || !foundUser)
      return { success: false, msg: '未找到该用户，请确认对方已注册 App' }

    // B. 检查是否已经在组织里
    // @ts-ignore
    const exists = orgMembers.value.find((m) => m.profiles?.email === email)
    if (exists) return { success: false, msg: '该用户已在组织中' }

    const { error: insertError } = await supabase.from('organization_members').insert({
      organization_id: currentOrg.value.id,
      // @ts-ignore
      user_id: foundUser.id,
      role: 'member'
    })

    if (insertError) return { success: false, msg: insertError.message }

    await fetchMembers()
    return { success: true, msg: '邀请成功' }
  }

  return {
    currentOrg,
    myOrgs,
    orgMembers,
    loading,
    initOrg,
    switchOrg,
    createOrg,
    fetchMembers,
    inviteMember,
    fetchMyOrgs
  }
}
