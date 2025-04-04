import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, QrCode, KeyRound, Check, Moon, Sun, Shield, AlertTriangle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    }),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    newPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const mfaFormSchema = z.object({
  code: z.string().length(6, {
    message: "Verification code must be 6 characters.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type MFAFormValues = z.infer<typeof mfaFormSchema>;

interface CommunitySettings {
  disable_community: boolean;
  hide_sensitive_content: boolean;
  auto_moderation: boolean;
  mute_notifications: boolean;
  allow_direct_messages: boolean;
}

const SettingsPage = () => {
  const { user, enrollMFA, verifyMFA, isPremium } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isEnrollingMFA, setIsEnrollingMFA] = useState(false);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingCommunitySettings, setIsSavingCommunitySettings] = useState(false);
  
  // Community settings
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings>({
    disable_community: false,
    hide_sensitive_content: true,
    auto_moderation: true,
    mute_notifications: false,
    allow_direct_messages: true,
  });
  
  // AI Settings
  const [useVoiceInput, setUseVoiceInput] = useState(true);
  const [useVoiceOutput, setUseVoiceOutput] = useState(true);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Profile Form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Password Form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // MFA Form
  const mfaForm = useForm<MFAFormValues>({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: {
      code: "",
    },
  });
  
  // Load community settings from database
  useEffect(() => {
    const loadCommunitySettings = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('community_settings')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data && data.community_settings) {
          setCommunitySettings(data.community_settings as CommunitySettings);
        }
      } catch (error) {
        console.error("Error loading community settings:", error);
        toast.error("Failed to load privacy settings");
      }
    };
    
    loadCommunitySettings();
  }, [user]);

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Profile updated successfully!");
      
      // In a real app, you'd update the user profile in Supabase here
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password form submission
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Password changed successfully!");
      
      // In a real app, you'd update the password in Supabase here
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle MFA setup
  const handleEnrollMFA = async () => {
    setIsEnrollingMFA(true);
    try {
      const qrCode = await enrollMFA();
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Error enrolling MFA:", error);
      toast.error("Failed to set up two-factor authentication. Please try again.");
    } finally {
      setIsEnrollingMFA(false);
    }
  };

  // Handle MFA verification
  const onMFASubmit = async (data: MFAFormValues) => {
    try {
      const success = await verifyMFA(data.code);
      
      if (success) {
        setIsMFAEnabled(true);
        setQrCodeUrl("");
        toast.success("Two-factor authentication enabled successfully!");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying MFA code:", error);
      toast.error("Failed to verify authentication code. Please try again.");
    }
  };
  
  // Handle community settings update
  const handleSaveCommunitySettings = async () => {
    if (!user?.id) return;
    
    setIsSavingCommunitySettings(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          community_settings: communitySettings
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Privacy settings updated successfully!");
    } catch (error) {
      console.error("Error saving community settings:", error);
      toast.error("Failed to update privacy settings. Please try again.");
    } finally {
      setIsSavingCommunitySettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="w-full max-w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Safety</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-2xl">{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="text-xl font-medium">{user?.name}</h3>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                    <div>
                      <Button size="sm" variant="outline">Change Avatar</Button>
                    </div>
                  </div>
                </div>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={true} />
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed directly. Contact support for help.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isUpdatingProfile} className="w-full sm:w-auto">
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isChangingPassword} className="w-full sm:w-auto">
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an additional layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMFAEnabled ? (
                  <div className="flex items-center space-x-2">
                    <Check className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium">Two-factor authentication is enabled</p>
                      <p className="text-sm text-muted-foreground">Your account is now more secure</p>
                    </div>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-white p-4 rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-sm text-center max-w-md">
                        Scan this QR code with an authenticator app like Google Authenticator or Authy. Then enter the verification code below.
                      </p>
                    </div>
                    
                    <Form {...mfaForm}>
                      <form onSubmit={mfaForm.handleSubmit(onMFASubmit)} className="space-y-4">
                        <FormField
                          control={mfaForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center">
                              <FormLabel>Verification Code</FormLabel>
                              <FormControl>
                                <InputOTP
                                  maxLength={6}
                                  render={({ slots }) => (
                                    <InputOTPGroup>
                                      {slots.map((slot, index) => (
                                        <InputOTPSlot key={index} {...slot} index={index} />
                                      ))}
                                    </InputOTPGroup>
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-center">
                          <Button type="submit">Verify and Enable</Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <p className="text-sm">
                      Two-factor authentication adds an extra layer of security to your account by requiring both your password and a verification code from an authenticator app.
                    </p>
                    <Button 
                      onClick={handleEnrollMFA} 
                      disabled={isEnrollingMFA}
                      className="w-full sm:w-auto"
                    >
                      {isEnrollingMFA ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
                        </>
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" /> Enable Two-Factor Authentication
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how MindSpring looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="theme-toggle" className="text-base font-medium">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Switch between dark and light themes
                        </p>
                      </div>
                      <Switch
                        id="theme-toggle"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className={`border-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-primary' : 'border-transparent'}`} onClick={() => setTheme('dark')}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center">
                          <Moon className="mr-2 h-4 w-4" /> Dark Mode
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="h-20 bg-black rounded-md border border-border flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary"></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`border-2 cursor-pointer transition-all ${theme === 'light' ? 'border-primary' : 'border-transparent'}`} onClick={() => setTheme('light')}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center">
                          <Sun className="mr-2 h-4 w-4" /> Light Mode
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="h-20 bg-white rounded-md border border-border flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy & Safety Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Community Privacy & Safety
                </CardTitle>
                <CardDescription>
                  Control your experience in the community to maintain your mental wellbeing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50 mb-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-500">Mental Health Safety</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        These controls are designed to help you create a safe and supportive environment. 
                        Use them to limit exposure to content that may negatively impact your mental health.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="disable-community" className="text-base font-medium">Disable Community Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Completely turn off access to community posts and interactions
                      </p>
                    </div>
                    <Switch
                      id="disable-community"
                      checked={communitySettings.disable_community}
                      onCheckedChange={(checked) => 
                        setCommunitySettings({...communitySettings, disable_community: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="hide-sensitive" className="text-base font-medium">Hide Sensitive Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Filter out posts with potentially triggering content
                      </p>
                    </div>
                    <Switch
                      id="hide-sensitive"
                      checked={communitySettings.hide_sensitive_content}
                      onCheckedChange={(checked) => 
                        setCommunitySettings({...communitySettings, hide_sensitive_content: checked})
                      }
                      disabled={communitySettings.disable_community}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-moderation" className="text-base font-medium">Enable Content Moderation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically filter harmful or abusive content
                      </p>
                    </div>
                    <Switch
                      id="auto-moderation"
                      checked={communitySettings.auto_moderation}
                      onCheckedChange={(checked) => 
                        setCommunitySettings({...communitySettings, auto_moderation: checked})
                      }
                      disabled={communitySettings.disable_community}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="mute-notifications" className="text-base font-medium">Mute Community Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Stop receiving notifications about community activity
                      </p>
                    </div>
                    <Switch
                      id="mute-notifications"
                      checked={communitySettings.mute_notifications}
                      onCheckedChange={(checked) => 
                        setCommunitySettings({...communitySettings, mute_notifications: checked})
                      }
                      disabled={communitySettings.disable_community}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-dm" className="text-base font-medium">Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other community members contact you directly
                      </p>
                    </div>
                    <Switch
                      id="allow-dm"
                      checked={communitySettings.allow_direct_messages}
                      onCheckedChange={(checked) => 
                        setCommunitySettings({...communitySettings, allow_direct_messages: checked})
                      }
                      disabled={communitySettings.disable_community}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveCommunitySettings} 
                  disabled={isSavingCommunitySettings}
                  className="w-full sm:w-auto"
                >
                  {isSavingCommunitySettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Privacy Settings"
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Report Help</CardTitle>
                <CardDescription>
                  Get help with harassment or harmful content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  If you've encountered harassment, harmful content, or other issues in the community,
                  our support team is here to help. You can report specific posts or contact us directly.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">
                    Report Content
                  </Button>
                  <Button variant="secondary">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Assistant Tab */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Settings</CardTitle>
                <CardDescription>
                  Customize how the AI assistant interacts with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...profileForm}>
                  <div className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name" 
                      render={() => (
                        <FormItem className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel>Voice Input</FormLabel>
                            <FormDescription>
                              Allow speaking to the AI assistant
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={useVoiceInput}
                              onCheckedChange={setUseVoiceInput}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={() => (
                        <FormItem className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel>Voice Output</FormLabel>
                            <FormDescription>
                              Allow the AI assistant to speak responses
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={useVoiceOutput}
                              onCheckedChange={setUseVoiceOutput}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
                
                {!isPremium && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Advanced AI Features</h3>
                        <p className="text-sm text-muted-foreground">Unlock advanced AI capabilities with premium</p>
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/premium'} 
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        size="sm"
                      >
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...profileForm}>
                  <div className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name" 
                      render={() => (
                        <FormItem className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>
                              Receive reminders and updates via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={emailNotifications}
                              onCheckedChange={setEmailNotifications}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={() => (
                        <FormItem className="flex items-center justify-between space-x-2">
                          <div className="space-y-0.5">
                            <FormLabel>Push Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications in your browser
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={pushNotifications}
                              onCheckedChange={setPushNotifications}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
