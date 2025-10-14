import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ArrowLeft, ArrowRight, Check, Store, User, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const steps = [
  { id: 1, title: 'Business Information', icon: Store },
  { id: 2, title: 'Contact Details', icon: Phone },
  { id: 3, title: 'About Your Store', icon: User },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shop_name: '',
    business_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    about_seller: '<p>Tell buyers about your store, your products, and what makes you unique...</p>',
  });

  useEffect(() => {
    // Check if user already completed onboarding
    const checkOnboarding = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('sellers')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding:', error);
        return;
      }

      // If already completed, redirect to dashboard
      if (data?.onboarding_completed) {
        navigate('/dashboard');
      }
    };

    checkOnboarding();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setError('');
    
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.shop_name || !formData.business_name) {
        setError('Please fill in all required fields');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.phone || !formData.address || !formData.city) {
        setError('Please fill in all required fields');
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!formData.about_seller || formData.about_seller.trim().length < 50) {
      setError('Please provide a description (at least 50 characters) about your store');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('sellers')
        .update({
          shop_name: formData.shop_name,
          business_name: formData.business_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          about_seller: formData.about_seller,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Redirect to dashboard with tour parameter
      navigate('/dashboard?tour=start');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setError('Failed to save information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Seller Portal! 🎉</h1>
          <p className="text-muted-foreground">
            Let's set up your store profile so buyers can learn about you
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      step.id < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id === currentStep
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden md:block">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Tell us about your business'}
                {currentStep === 2 && 'How can customers reach you?'}
                {currentStep === 3 && 'Share your story with buyers'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Shop Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="shop_name"
                      value={formData.shop_name}
                      onChange={handleInputChange}
                      placeholder="My Awesome Store"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be displayed to buyers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Business Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      placeholder="ABC Trading Company"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your legal business name
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Address <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        City <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ZIP Code</label>
                    <Input
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </>
              )}

              {/* Step 3: About Seller */}
              {currentStep === 3 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    About Your Store <span className="text-destructive">*</span>
                  </label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tell buyers about your business, products, and what makes you special. 
                    This will be displayed on your seller profile in the e-commerce site.
                  </p>
                  <RichTextEditor
                    value={formData.about_seller}
                    onChange={(value) => setFormData({ ...formData, about_seller: value })}
                    placeholder="Share your story: What do you sell? What's your mission? Why should buyers choose you?"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use headings, lists, and formatting to make your story engaging!
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
}
