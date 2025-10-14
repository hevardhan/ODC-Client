import { motion } from "framer-motion"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const earningsData = [
  { month: 'Jan', earnings: 4200 },
  { month: 'Feb', earnings: 3800 },
  { month: 'Mar', earnings: 5100 },
  { month: 'Apr', earnings: 4600 },
  { month: 'May', earnings: 6200 },
  { month: 'Jun', earnings: 5800 },
  { month: 'Jul', earnings: 6500 },
  { month: 'Aug', earnings: 7100 },
  { month: 'Sep', earnings: 6800 },
  { month: 'Oct', earnings: 7500 },
  { month: 'Nov', earnings: 8200 },
  { month: 'Dec', earnings: 9100 }
]

const summaryCards = [
  {
    title: "Total Earnings",
    value: "$75,231",
    icon: DollarSign,
    description: "All-time earnings",
    trend: "+20.1% from last year"
  },
  {
    title: "This Month",
    value: "$9,100",
    icon: Calendar,
    description: "Current month earnings",
    trend: "+10.2% from last month"
  },
  {
    title: "Average Monthly",
    value: "$6,269",
    icon: TrendingUp,
    description: "Monthly average",
    trend: "+15.3% from last year"
  }
]

export function Earnings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">Track your revenue and earnings</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {summaryCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                <p className="text-xs text-green-600 mt-2">{card.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
            <CardDescription>Your monthly earnings for the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Earnings']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
            <CardDescription>Detailed view of your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Product Sales</p>
                  <p className="text-sm text-muted-foreground">From 1,234 orders</p>
                </div>
                <p className="text-xl font-bold">$68,450</p>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Shipping Fees</p>
                  <p className="text-sm text-muted-foreground">Additional revenue</p>
                </div>
                <p className="text-xl font-bold">$4,231</p>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Other Income</p>
                  <p className="text-sm text-muted-foreground">Miscellaneous</p>
                </div>
                <p className="text-xl font-bold">$2,550</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
