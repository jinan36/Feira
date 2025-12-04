import type { Database } from '~/types/database.types'
import { toast } from 'vue-sonner'

type Product = Database['public']['Tables']['products']['Row']

export const useProducts = () => {
  const supabase = useSupabaseClient<Database>()
  const { currentOrg } = useOrg()

  // 状态
  const products = useState<Product[]>('products', () => [])
  const loading = useState<boolean>('productsLoading', () => false)

  // 1. 获取商品列表 (支持搜索)
  const fetchAllProducts = async (search = '') => {
    if (!currentOrg.value?.id) return

    loading.value = true
    let query = supabase
      .from('products')
      .select('*, vendors(name)') // 联表查询供应商名字
      .eq('organization_id', currentOrg.value.id)
      .order('name')

    // 模糊搜索
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载商品失败', { description: error.message })
    } else {
      products.value = data || []
    }
    loading.value = false
  }

  const toggleStatus = async (product: any) => {
    const oldStatus = product.is_needed
    product.is_needed = !oldStatus

    const { error } = await supabase
      .from('products')
      .update({ is_needed: product.is_needed })
      .eq('id', product.id)

    if (error) {
      // 失败回滚
      product.is_needed = oldStatus
      toast.error('操作失败', { description: error.message })
    } else {
      // 可选：成功不弹窗，或者只在“加入”时弹一个轻提示
      if (product.is_needed) {
        toast.success(`已加入购物清单: ${product.name}`)
      }
    }
  }

  // 3. 创建新商品
  const createProduct = async (name: string, vendorId: string) => {
    if (!currentOrg.value?.id) return false

    const promise = (async () => {
      if (!currentOrg.value) throw new Error('组织未加载')
      const { error } = await supabase.from('products').insert({
        name,
        vendor_id: vendorId,
        organization_id: currentOrg.value.id,
        is_needed: true // 新录入的默认就是急需买的
      })
      if (error) throw error

      await fetchAllProducts() // 刷新列表
      return name
    })()

    try {
      await toast.promise(promise, {
        loading: '正在录入...',
        success: (n: string) => `${n} 已录入并加入清单`,
        error: (e: any) => e.message
      })
      return true
    } catch {
      return false
    }
  }

  // 4. 删除商品
  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error('删除失败', { description: error.message })
    } else {
      products.value = products.value.filter((p) => p.id !== id)
      toast.success('商品已删除')
    }
  }

  return {
    products,
    loading,
    fetchAllProducts,
    toggleStatus,
    createProduct,
    deleteProduct
  }
}
