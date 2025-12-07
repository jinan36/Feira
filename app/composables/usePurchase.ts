// composables/usePurchase.ts
import type { Database } from '~/types/database.types'
import { toast } from 'vue-sonner'

export const usePurchase = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const { currentOrg } = useOrg()
  const submitPurchase = async (params: {
    product: any
    price: number
    quantity?: number | null
    unit?: string | null
  }) => {
    if (!currentOrg.value?.id) return false
    const { product, price, quantity, unit } = params

    const purchaseLogic = (async () => {
      if (!currentOrg.value) return new Error('未加载组织')
      const { error: recordError } = await supabase.from('purchase_records').insert({
        organization_id: currentOrg.value.id,
        product_id: product.id,
        product_name: product.name, // 冗余存名
        vendor_name: product.vendors?.name, // 冗余存供应商
        price: price,
        quantity: quantity || null, // 可选
        unit: unit || null, // 可选
        purchased_by: user.value?.id
      })
      if (recordError) throw recordError

      // ... 数据库更新状态 ...
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_needed: false })
        .eq('id', product.id)
      if (updateError) throw updateError

      return product.name
    })()

    toast.promise(purchaseLogic, {
      loading: '正在提交...',
      success: (name: string) => `已购买 ${name}`,
      error: (e: any) => `提交失败: ${e.message}`
    })

    try {
      await purchaseLogic
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return {
    submitPurchase
  }
}
