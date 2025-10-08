'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Mail,
  Inbox,
  Filter,
  Settings,
  Shield,
  Globe,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Play,
  Zap,
  BookOpen,
  Users,
  Lock,
  Star,
  Clock,
  Target,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  action: string;
  actionLink?: string;
  completed: boolean;
  features?: Array<{
    title: string;
    description: string;
    icon: any;
    color: string;
  }>;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to News360!",
    description: "Your beautiful newsletter inbox. Let's get you set up in just a few steps.",
    icon: Sparkles,
    action: "Get Started",
    completed: false,
    features: [
      {
        title: "Email Integration",
        description: "Connect Gmail & Outlook",
        icon: Mail,
        color: "blue"
      },
      {
        title: "Smart Organization", 
        description: "Categories & filters",
        icon: Filter,
        color: "purple"
      },
      {
        title: "Beautiful Reading",
        description: "Distraction-free experience",
        icon: BookOpen,
        color: "green"
      }
    ]
  },
  {
    id: 2,
    title: "Connect Your Email",
    description: "Connect Gmail or Outlook to start importing newsletters. We only access emails you whitelist.",
    icon: Mail,
    action: "Connect Email",
    actionLink: "/settings/email",
    completed: false
  },
  {
    id: 3,
    title: "Organize & Read",
    description: "Create categories, use filters, and enjoy distraction-free reading in your inbox.",
    icon: Inbox,
    action: "View Inbox",
    actionLink: "/inbox",
    completed: false
  },
  {
    id: 4,
    title: "Customize & Explore",
    description: "Set up reading preferences, keyboard shortcuts, and discover advanced features.",
    icon: Settings,
    action: "Explore Settings",
    actionLink: "/settings",
    completed: false
  },
  {
    id: 5,
    title: "You're All Set!",
    description: "Start enjoying your organized newsletter experience. Need help? Check our guides anytime.",
    icon: CheckCircle,
    action: "Start Reading",
    completed: false
  }
];

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingGuide({ isOpen, onClose, onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    if (isOpen) {
      loadOnboardingProgress();
    } else {
      // Reset to first step when modal closes
      setCurrentStep(0);
      setIsTransitioning(false);
    }
  }, [isOpen]);

  const loadOnboardingProgress = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/user/onboarding');
      if (response.ok) {
        const data = await response.json();
        const savedStep = data.onboardingStep || 0;
        // Ensure the step is within bounds
        const validStep = Math.min(Math.max(0, savedStep), ONBOARDING_STEPS.length - 1);
        setCurrentStep(validStep);
        setCompletedSteps(new Set(data.completedSteps || []));
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
      // Fallback to first step if there's an error
      setCurrentStep(0);
    }
  };

  const updateOnboardingProgress = async (step: number, completed: boolean) => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          step, 
          completed,
          completedSteps: Array.from(completedSteps)
        }),
      });
      
      if (response.ok) {
        if (completed) {
          setCompletedSteps(prev => new Set([...prev, step]));
        }
      }
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === currentStep) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setIsTransitioning(false);
    }, 150);
  };

  // Ensure currentStep is within bounds
  const safeCurrentStep = Math.min(Math.max(0, currentStep), ONBOARDING_STEPS.length - 1);
  const currentStepData = ONBOARDING_STEPS[safeCurrentStep];
  const progress = ((safeCurrentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = async () => {
    const currentStepData = ONBOARDING_STEPS[currentStep];
    
    // Mark current step as completed
    await updateOnboardingProgress(currentStepData.id, true);
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    } else {
      // Complete onboarding
      await updateOnboardingProgress(ONBOARDING_STEPS.length, true);
      onComplete();
      toast.success('Welcome to News360! You\'re all set up.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleSkip = async () => {
    if (confirm('Are you sure you want to skip the onboarding? You can always access it later from the help menu.')) {
      await updateOnboardingProgress(ONBOARDING_STEPS.length, true);
      onComplete();
      toast.info('Onboarding skipped. You can access it anytime from the help menu.');
    }
  };

  const handleActionClick = () => {
    if (currentStepData.actionLink) {
      window.open(currentStepData.actionLink, '_blank');
    }
  };

  const getFeatureColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full bg-background border border-border shadow-2xl rounded-2xl p-0 h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="relative p-6 border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:20px_20px] opacity-30" />
          <div className="relative flex items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">Welcome to News360</DialogTitle>
                <p className="text-sm text-muted-foreground">Let's get you started in just a few steps</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Progress and Steps */}
          <div className="w-80 border-r border-border bg-muted/10 p-6 overflow-y-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Progress</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {safeCurrentStep + 1} of {ONBOARDING_STEPS.length}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border-2",
                    "hover:bg-accent/50 hover:border-primary/30 hover:shadow-md",
                    index === safeCurrentStep 
                      ? "bg-primary/10 border-primary/40 shadow-lg ring-2 ring-primary/20" 
                      : "bg-background border-border",
                    index < safeCurrentStep && "bg-green-50 border-green-200 hover:border-green-300"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                      index === safeCurrentStep 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : index < safeCurrentStep
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-muted text-muted-foreground group-hover:bg-accent"
                    )}>
                      {index < safeCurrentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-sm font-semibold transition-colors",
                        index === safeCurrentStep ? "text-primary" : "text-foreground"
                      )}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {index === safeCurrentStep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className={cn(
              "max-w-2xl mx-auto transition-all duration-300",
              isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            )}>
              {/* Step Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-primary/20">
                  <currentStepData.icon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {currentStepData.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step-specific content */}
              <div className="space-y-8">
                {safeCurrentStep === 0 && currentStepData.features && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentStepData.features.map((feature, index) => (
                      <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background to-muted/20">
                        <CardContent className="p-6 text-center">
                          <div className={cn(
                            "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md border",
                            getFeatureColorClasses(feature.color)
                          )}>
                            <feature.icon className="h-8 w-8" />
                          </div>
                          <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {safeCurrentStep === 1 && (
                  <div className="space-y-6">
                    <Card className="p-6 border-primary/20 bg-gradient-to-br from-blue-50 to-blue-100/50">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Secure & Private</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            We only access emails you whitelist. Your data stays private and secure.
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Lock className="h-3 w-3" />
                              <span>End-to-end encryption</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>No data sharing</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border-primary/20 bg-gradient-to-br from-green-50 to-green-100/50">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Globe className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Multiple Providers</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Connect Gmail, Outlook, and other email providers seamlessly.
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Zap className="h-3 w-3" />
                              <span>Quick setup</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>Selective import</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {safeCurrentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 border-primary/20 bg-gradient-to-br from-purple-50 to-purple-100/30">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shadow-md">
                            <Filter className="h-5 w-5 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-foreground">Smart Filters</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Filter by sender, date, read status, and more to find exactly what you need.
                        </p>
                      </Card>
                      <Card className="p-6 border-primary/20 bg-gradient-to-br from-blue-50 to-blue-100/30">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                            <Star className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-foreground">Categories</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Organize newsletters into custom categories for better discovery.
                        </p>
                      </Card>
                    </div>
                    <Card className="p-6 border-primary/20 bg-gradient-to-br from-amber-50 to-amber-100/50">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <BookOpen className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Reading Experience</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Enjoy distraction-free reading with customizable fonts, themes, and layouts.
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Reading time estimates</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Lightbulb className="h-3 w-3" />
                              <span>Smart formatting</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {safeCurrentStep === 3 && (
                  <div className="space-y-6">
                    <Card className="p-6 border-primary/20 bg-gradient-to-br from-indigo-50 to-indigo-100/30">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shadow-md">
                          <Settings className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h4 className="font-semibold text-foreground">Customization</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Personalize your experience with themes, reading preferences, and notification settings.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span>Reading themes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span>Font preferences</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span>Keyboard shortcuts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span>Notification settings</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {safeCurrentStep === 4 && (
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-green-200">
                      <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-2xl font-bold text-foreground">You're All Set!</h4>
                      <p className="text-muted-foreground max-w-md mx-auto text-lg">
                        Start exploring your organized newsletter inbox. Need help? Check our guides anytime.
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Start reading</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Customize settings</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {safeCurrentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 hover:bg-accent border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Skip Tour
              </Button>
              
              {currentStepData.actionLink ? (
                <Button
                  onClick={handleActionClick}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <span>{currentStepData.action}</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Completing...</span>
                    </>
                  ) : (
                    <>
                      <span>{safeCurrentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 