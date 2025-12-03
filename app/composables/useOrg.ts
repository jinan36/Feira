import type { Database } from '~/types/database.types'

import { toast } from 'vue-sonner'

type Org = Database['public']['Tables']['organizations']['Row']

export const useOrg = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  // 全局状态 (State)
  const currentOrg = useState<Org | null>('currentOrg', () => null)
  const myOrgs = useState<Org[]>('myOrgs', () => [])
  const loading = useState<boolean>('orgLoading', () => false)

  // 1. 初始化
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
          .maybeSingle()

        if (org) currentOrg.value = org
      }

      await fetchMyOrgs()
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
    if (!userId) return

    const targetOrg = myOrgs.value.find((o) => o.id === orgId)
    if (targetOrg) {
      currentOrg.value = targetOrg

      const { error } = await supabase
        .from('profiles')
        .update({ current_org_id: orgId })
        .eq('id', userId)

      if (error) console.error('偏好保存失败', error)
      else console.log('已切换至', targetOrg.name)
    }
  }

  const createOrg = async (name: string) => {
    const userId = user.value?.sub || user.value?.id
    if (!userId) return false

    const promise = (async () => {
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
      return newOrg.name
    })()

    try {
      await toast.promise(promise, {
        loading: '正在创建...',
        success: (n: string) => `创建成功：${n}`,
        error: (e: any) => e.message
      })
      return true
    } catch {
      return false
    }
  }

  return {
    currentOrg,
    myOrgs,
    loading,
    initOrg,
    switchOrg,
    createOrg,
    fetchMyOrgs
  }
}
