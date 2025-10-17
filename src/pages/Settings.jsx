import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

export function Settings() {
  const { user, updateProfile, refreshUser } = useAuth()
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    shopName: "",
    phone: "",
    businessName: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [loading, setLoading] = useState(false)

  // Update profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || "",
        email: user.email || "",
        shopName: user.shop_name || "",
        phone: user.phone || "",
        businessName: user.business_name || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zip_code || ""
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('sellers')
        .update({
          full_name: profileData.fullName,
          shop_name: profileData.shopName,
          phone: profileData.phone,
          business_name: profileData.businessName,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zipCode
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh user data in context
      await refreshUser()
      
      setMessage({ type: "success", text: "Profile updated successfully!" })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters!" })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage({ type: "success", text: "Password updated successfully!" })
      setPasswordData({ newPassword: "", confirmPassword: "" })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } catch (error) {
      console.error('Error updating password:', error)
      setMessage({ type: "error", text: "Failed to update password. Please try again." })
      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile and shop details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    name="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shop Name</label>
                  <Input
                    name="shopName"
                    type="text"
                    value={profileData.shopName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input
                    name="businessName"
                    type="text"
                    value={profileData.businessName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    name="address"
                    type="text"
                    value={profileData.address}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    name="city"
                    type="text"
                    value={profileData.city}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    name="state"
                    type="text"
                    value={profileData.state}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input
                    name="zipCode"
                    type="text"
                    value={profileData.zipCode}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Shop Settings</CardTitle>
            <CardDescription>Configure your shop preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Shop Status</p>
                <p className="text-sm text-muted-foreground">Your shop is currently active</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Manage email and push notifications</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Methods</p>
                <p className="text-sm text-muted-foreground">Manage how you receive payments</p>
              </div>
              <Button variant="outline">Setup</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
