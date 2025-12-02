import type { Database } from '~/types/database.types'

type Vendor = Database['public']['Tables']['vendors']['Row']

// composables/useVendors.ts
export const useVendors = () => {
  const supabase = useSupabaseClient()
  const { currentOrg } = useOrg()

  const vendors = useState<Vendor[]>('vendors', () => [])
  const loading = useState('vendorsLoading', () => false)

  // 1. 获取列表
  const fetchVendors = async () => {
    if (!currentOrg.value?.id) return

    loading.value = true
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('organization_id', currentOrg.value.id)
      .order('created_at', { ascending: false }) // 新建的在前面

    if (error) console.error(error)
    else vendors.value = data || []

    loading.value = false
  }

  // 2. 创建供应商
  const createVendor = async (name: string) => {
    if (!currentOrg.value?.id) return false // 返回 false 表示失败

    const { error } = await supabase.from('vendors').insert({
      name,
      organization_id: currentOrg.value.id
    })

    if (error) {
      alert(error.message)
      return false
    }

    await fetchVendors()
    return true
  }

  // 3. 删除供应商
  const deleteVendor = async (id: string) => {
    const { error } = await supabase.from('vendors').delete().eq('id', id)
    if (error) {
      alert('无法删除：可能还有商品关联着这个供应商。请先删除相关商品。')
    } else {
      // 本地移除
      vendors.value = vendors.value.filter((v) => v.id !== id)
    }
  }

  return { vendors, loading, fetchVendors, createVendor, deleteVendor }
}
