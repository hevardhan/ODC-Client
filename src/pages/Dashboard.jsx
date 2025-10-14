import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Package, ShoppingCart, DollarSign, Clock, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTourGuide, dashboardTourSteps } from "@/components/TourGuide"

const stats = [
  {
    title: "Total Products",
    value: "245",
    icon: Package,
    change: "+12%",
    color: "text-blue-600"
  },
  {
    title: "Total Orders",
    value: "1,234",
    icon: ShoppingCart,
    change: "+23%",
    color: "text-green-600"
  },
  {
    title: "Earnings",
    value: "$45,231",
    icon: DollarSign,
    change: "+18%",
    color: "text-yellow-600"
  },
  {
    title: "Pending Orders",
    value: "23",
    icon: Clock,
    change: "-5%",
    color: "text-red-600"
  }
]

const recentOrders = [
  { id: "#ORD-001", customer: "Alice Johnson", product: "Wireless Headphones", amount: "$89.99", status: "Delivered", date: "2024-03-15" },
  { id: "#ORD-002", customer: "Bob Smith", product: "Smart Watch", amount: "$299.99", status: "Pending", date: "2024-03-14" },
  { id: "#ORD-003", customer: "Carol White", product: "Laptop Stand", amount: "$45.50", status: "Delivered", date: "2024-03-13" },
  { id: "#ORD-004", customer: "David Brown", product: "USB-C Cable", amount: "$12.99", status: "Cancelled", date: "2024-03-12" },
  { id: "#ORD-005", customer: "Emma Davis", product: "Phone Case", amount: "$19.99", status: "Delivered", date: "2024-03-11" }
]

const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 }
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Dashboard() {
  const [searchParams] = useSearchParams()
  const { startTour } = useTourGuide(dashboardTourSteps)

  useEffect(() => {
    // Start tour if coming from onboarding
    if (searchParams.get('tour') === 'start') {
      setTimeout(() => {
        startTour()
      }, 500) // Small delay to ensure DOM is ready
    }
  }, [searchParams, startTour])

  return (
    <div className="space-y-6" data-tour="dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
        </div>
        <Button variant="outline" onClick={startTour}>
          <Rocket className="mr-2 h-4 w-4" />
          Take a Tour
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        data-tour="stats-cards"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  {' '}from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          data-tour="products-overview"
        >
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Your sales performance over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          data-tour="recent-orders"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
