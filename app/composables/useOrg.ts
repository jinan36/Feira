import type { Database } from '~/types/database.types'

import { toast } from 'vue-sonner'
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

    // 使用 toast.promise 处理异步加载状态
    const promise = (async () => {
      // A. 插入组织
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, owner_id: userId, is_personal: false })
        .select()
        .single()

      if (orgError) throw new Error(orgError.message)

      // B. 插入成员
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({ organization_id: newOrg.id, user_id: userId, role: 'owner' })

      if (memberError) throw new Error(memberError.message)

      // C. 刷新并切换
      await fetchMyOrgs()
      await switchOrg(newOrg.id)
      return newOrg.name
    })()

    // 绑定 Toast UI
    try {
      const orgName = await toast.promise(promise, {
        loading: '正在创建组织...',
        success: (name: string) => `成功创建并切换至 ${name}`,
        error: (err) => `创建失败: ${err.message}`
      })
      return true // 返回 true 让页面知道要关闭抽屉
    } catch {
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
    if (!currentOrg.value?.id) {
      toast.error('未选中组织')
      return false
    }

    if (currentOrg.value.is_personal) {
      toast.error('操作被拒绝', { description: '个人组织无法邀请成员，请先创建新组织。' })
      return false
    }

    const promise = (async () => {
      // A. 找人
      const { data: foundUser, error: findError } = await supabase.rpc('get_profile_by_email', {
        email_input: email
      })

      if (findError || !foundUser) throw new Error('未找到该用户，请确认对方已注册 App')

      // B. 查重
      // @ts-ignore
      const exists = orgMembers.value.find((m) => m.profiles?.email === email)
      if (exists) throw new Error('该用户已在组织中')

      // C. 拉入
      const { error: insertError } = await supabase.from('organization_members').insert({
        organization_id: currentOrg.value.id,
        // @ts-ignore
        user_id: foundUser.id,
        role: 'member'
      })

      if (insertError) throw new Error(insertError.message)

      await fetchMembers()
      return foundUser.email // 返回邮箱用于显示
    })()

    try {
      await toast.promise(promise, {
        loading: '正在查找用户...',
        success: (email: string) => `已成功邀请 ${email}`,
        error: (err) => err.message
      })
      return true
    } catch {
      return false
    }
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
