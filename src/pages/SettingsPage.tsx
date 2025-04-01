
import { useState } from "react";
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
import Header from "@/components/Header";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, QrCode, KeyRound, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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

const SettingsPage = () => {
  const { user, enrollMFA, verifyMFA, isPremium } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isEnrollingMFA, setIsEnrollingMFA] = useState(false);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
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
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-toggle">Dark Mode</Label>
                    <Switch
                      id="theme-toggle"
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Switch between dark and light themes
                  </p>
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
