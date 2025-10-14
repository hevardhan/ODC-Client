import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const orders = [
  { id: "#ORD-001", customer: "Alice Johnson", product: "Wireless Headphones", amount: "$89.99", status: "Delivered", date: "2024-03-15" },
  { id: "#ORD-002", customer: "Bob Smith", product: "Smart Watch", amount: "$299.99", status: "Pending", date: "2024-03-14" },
  { id: "#ORD-003", customer: "Carol White", product: "Laptop Stand", amount: "$45.50", status: "Delivered", date: "2024-03-13" },
  { id: "#ORD-004", customer: "David Brown", product: "USB-C Cable", amount: "$12.99", status: "Cancelled", date: "2024-03-12" },
  { id: "#ORD-005", customer: "Emma Davis", product: "Phone Case", amount: "$19.99", status: "Delivered", date: "2024-03-11" },
  { id: "#ORD-006", customer: "Frank Wilson", product: "Bluetooth Speaker", amount: "$65.00", status: "Pending", date: "2024-03-10" },
  { id: "#ORD-007", customer: "Grace Lee", product: "Tablet Case", amount: "$29.99", status: "Delivered", date: "2024-03-09" },
  { id: "#ORD-008", customer: "Henry Martinez", product: "Power Bank", amount: "$39.99", status: "Pending", date: "2024-03-08" },
  { id: "#ORD-009", customer: "Ivy Garcia", product: "Wireless Mouse", amount: "$24.99", status: "Delivered", date: "2024-03-07" },
  { id: "#ORD-010", customer: "Jack Anderson", product: "Keyboard", amount: "$79.99", status: "Cancelled", date: "2024-03-06" },
]

const getStatusBadge = (status) => {
  const variants = {
    Delivered: "default",
    Pending: "secondary",
    Cancelled: "destructive"
  }
  return variants[status] || "default"
}

export function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View and manage your customer orders</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>A complete list of customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
