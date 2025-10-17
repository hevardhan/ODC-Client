import { supabase } from "@/lib/supabase"

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Fetch all required data in parallel
    const [productsResult, ordersResult, earningsResult] = await Promise.all([
      supabase
        .from("products")
        .select("id, status")
        .eq("seller_id", user.id),
      supabase
        .from("orders")
        .select("id, status, amount")
        .eq("seller_id", user.id),
      supabase
        .from("earnings")
        .select("amount")
        .eq("seller_id", user.id)
    ])

    if (productsResult.error) throw productsResult.error
    if (ordersResult.error) throw ordersResult.error
    if (earningsResult.error) throw earningsResult.error

    const products = productsResult.data || []
    const orders = ordersResult.data || []
    const earnings = earningsResult.data || []

    // Calculate statistics
    const totalProducts = products.length
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'Pending').length
    const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0)

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      totalEarnings
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}

/**
 * Get recent orders for dashboard
 */
export async function getRecentOrders(limit = 5) {
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
          name
        )
      `)
      .eq("seller_id", user.id)
      .order("order_date", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw error
  }
}

/**
 * Get monthly revenue chart data
 */
export async function getMonthlyRevenue() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("earnings")
      .select("amount, month, year")
      .eq("seller_id", user.id)
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData = {}
    data?.forEach(earning => {
      const key = `${earning.year}-${earning.month}`
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: earning.month,
          year: earning.year,
          value: 0
        }
      }
      monthlyData[key].value += parseFloat(earning.amount)
    })

    // Convert to array and format for chart
    const chartData = Object.values(monthlyData).map(item => ({
      name: getMonthName(item.month),
      value: item.value
    }))

    // If no data, return empty array for last 6 months
    if (chartData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      return months.map(name => ({ name, value: 0 }))
    }

    return chartData
  } catch (error) {
    console.error("Error fetching monthly revenue:", error)
    throw error
  }
}

function getMonthName(month) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[month - 1] || 'Unknown'
}
