// composables/useMembers.ts
import type { Database } from '~/types/database.types'
import { toast } from 'vue-sonner'

type OrgMember = {
  id: string
  role: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
    email: string | null
  } | null
}

type SearchResult = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export const useMembers = () => {
  const supabase = useSupabaseClient<Database>()
  const { currentOrg } = useOrg()

  const members = useState<OrgMember[]>('orgMembers', () => [])
  const loading = useState<boolean>('membersLoading', () => false)

  const fetchMembers = async () => {
    if (!currentOrg.value?.id) return

    loading.value = true
    const { data, error } = await supabase
      .from('organization_members')
      .select('id, role, profiles(full_name, avatar_url, email)')
      .eq('organization_id', currentOrg.value.id)

    if (error) console.error('加载成员失败', error)
    else members.value = (data as any) || []

    loading.value = false
  }

  const inviteMember = async (email: string) => {
    if (!currentOrg.value?.id) {
      toast.error('未选中组织')
      return false
    }

    if (currentOrg.value.is_personal) {
      toast.error('操作被拒绝', { description: '个人组织无法邀请成员。' })
      return false
    }

    const promise = (async () => {
      const { data: rawData, error: findError } = await supabase.rpc('get_profile_by_email', {
        email_input: email
      })

      const foundUser = rawData as SearchResult | null

      if (findError || !foundUser) throw new Error('未找到该用户，请确认对方已注册')

      // @ts-ignore
      const exists = members.value.find((m) => m.profiles?.email === email)
      if (exists) throw new Error('该用户已在组织中')

      if (!currentOrg.value) throw new Error('未知错误')
      const { error: insertError } = await supabase.from('organization_members').insert({
        organization_id: currentOrg.value.id,
        // @ts-ignore
        user_id: foundUser.id,
        role: 'member'
      })

      if (insertError) throw insertError

      await fetchMembers()
      return foundUser.email
    })()

    try {
      await toast.promise(promise, {
        loading: '正在查找...',
        success: (m: string) => `已邀请 ${m}`,
        error: (e: any) => e.message
      })
      return true
    } catch {
      return false
    }
  }

  return {
    members,
    loading,
    fetchMembers,
    inviteMember
  }
}
