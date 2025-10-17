import { supabase } from "@/lib/supabase"

/**
 * Fetch all earnings for the current seller
 */
export async function getEarnings() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("earnings")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching earnings:", error)
    throw error
  }
}

/**
 * Get earnings grouped by month
 */
export async function getMonthlyEarnings() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("earnings")
      .select("month, year, amount")
      .eq("seller_id", user.id)
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (error) throw error

    // Group by month and year
    const grouped = {}
    data?.forEach(earning => {
      const key = `${earning.year}-${earning.month}`
      if (!grouped[key]) {
        grouped[key] = {
          month: earning.month,
          year: earning.year,
          earnings: 0
        }
      }
      grouped[key].earnings += parseFloat(earning.amount)
    })

    return Object.values(grouped)
  } catch (error) {
    console.error("Error fetching monthly earnings:", error)
    throw error
  }
}

/**
 * Get earnings statistics
 */
export async function getEarningsStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data: earnings, error } = await supabase
      .from("earnings")
      .select("amount, month, year, created_at")
      .eq("seller_id", user.id)

    if (error) throw error

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const total = earnings?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0
    const thisMonth = earnings
      ?.filter(e => e.month === currentMonth && e.year === currentYear)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0
    const prevMonth = earnings
      ?.filter(e => e.month === lastMonth && e.year === lastMonthYear)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0

    // Calculate average monthly earnings
    const monthlyTotals = {}
    earnings?.forEach(e => {
      const key = `${e.year}-${e.month}`
      monthlyTotals[key] = (monthlyTotals[key] || 0) + parseFloat(e.amount)
    })
    const monthCount = Object.keys(monthlyTotals).length || 1
    const average = total / monthCount

    return {
      total,
      thisMonth,
      average,
      monthlyChange: prevMonth > 0 ? ((thisMonth - prevMonth) / prevMonth * 100).toFixed(1) : 0
    }
  } catch (error) {
    console.error("Error fetching earnings stats:", error)
    throw error
  }
}

/**
 * Create earnings from order (automatically called when order is delivered)
 */
export async function createEarningsFromOrder(orderId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("seller_id", user.id)
      .single()

    if (orderError) throw orderError

    const orderDate = new Date(order.order_date)
    const month = orderDate.getMonth() + 1
    const year = orderDate.getFullYear()

    const { data, error } = await supabase
      .from("earnings")
      .insert([
        {
          seller_id: user.id,
          order_id: orderId,
          amount: order.amount,
          type: 'Product Sale',
          month,
          year
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating earnings:", error)
    throw error
  }
}
