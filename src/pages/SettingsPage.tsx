
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

// New schema for AI settings
const aiSettingsFormSchema = z.object({
  voiceEnabled: z.boolean(),
  speechEnabled: z.boolean(),
  voiceRate: z.array(z.number()),
  voiceType: z.string(),
});

const SettingsPage = () => {
  const { user } = useAuth();
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // AI settings form with proper initialization
  const aiSettingsForm = useForm<z.infer<typeof aiSettingsFormSchema>>({
    resolver: zodResolver(aiSettingsFormSchema),
    defaultValues: {
      voiceEnabled: true,
      speechEnabled: true,
      voiceRate: [1],
      voiceType: "female",
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    toast.success("Profile updated successfully");
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
    toast.success("Password updated successfully");
    passwordForm.reset();
  };

  const onAiSettingsSubmit = (data: z.infer<typeof aiSettingsFormSchema>) => {
    toast.success("AI settings updated successfully");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Manage your account preferences and settings
          </p>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full md:w-[400px] bg-secondary/30">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Update your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
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
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to secure your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
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
                              <Input type="password" placeholder="••••••" {...field} />
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
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Update Password</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai-settings">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>AI & Voice Settings</CardTitle>
                  <CardDescription>
                    Customize your AI assistant and voice interaction preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Form {...aiSettingsForm}>
                    <form onSubmit={aiSettingsForm.handleSubmit(onAiSettingsSubmit)} className="space-y-6">
                      <FormField
                        control={aiSettingsForm.control}
                        name="voiceEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Voice Responses</FormLabel>
                              <FormDescription>
                                Enable AI to respond with voice
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiSettingsForm.control}
                        name="speechEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Speech Input</FormLabel>
                              <FormDescription>
                                Enable voice commands and input
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiSettingsForm.control}
                        name="voiceRate"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center justify-between">
                              <FormLabel>Voice Rate</FormLabel>
                              <span className="text-sm text-muted-foreground">
                                {field.value[0].toFixed(1)}x
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                disabled={!aiSettingsForm.watch('voiceEnabled')}
                                min={0.5}
                                max={2}
                                step={0.1}
                                value={field.value}
                                onValueChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Slower</span>
                              <span>Faster</span>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiSettingsForm.control}
                        name="voiceType"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Voice Type</FormLabel>
                            <FormControl>
                              <Select
                                disabled={!aiSettingsForm.watch('voiceEnabled')}
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select voice type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="neutral">Neutral</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Volume2 className="mr-2 h-4 w-4" />
                          Save Voice Settings
                        </Button>
                        <Button 
                          type="button"
                          className="w-full mt-2" 
                          variant="outline"
                          onClick={() => {
                            // Test voice
                            const msg = new SpeechSynthesisUtterance();
                            msg.text = "This is a test of your voice settings.";
                            msg.rate = aiSettingsForm.watch('voiceRate')[0];
                            window.speechSynthesis.speak(msg);
                          }}
                        >
                          Test Voice
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
