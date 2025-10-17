import { supabase } from "@/lib/supabase"

/**
 * Fetch all orders for the current seller
 */
export async function getOrders() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        products (
          id,
          name,
          image_url
        )
      `)
      .eq("seller_id", user.id)
      .order("order_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, amount, quantity")
      .eq("seller_id", user.id)

    if (error) throw error

    const stats = {
      total: orders?.length || 0,
      pending: orders?.filter(o => o.status === 'Pending').length || 0,
      delivered: orders?.filter(o => o.status === 'Delivered').length || 0,
      cancelled: orders?.filter(o => o.status === 'Cancelled').length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + parseFloat(o.amount), 0) || 0
    }

    return stats
  } catch (error) {
    console.error("Error fetching order stats:", error)
    throw error
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("seller_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

/**
 * Create a new order (for testing/demo purposes)
 */
export async function createOrder(orderData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          seller_id: user.id,
          ...orderData
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}
