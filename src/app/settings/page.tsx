"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield, 
  Database,
  Palette,
  Clock,
  User
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and account settings
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data & API</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Light</Button>
                    <Button variant="default" size="sm">Dark</Button>
                    <Button variant="outline" size="sm">System</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Scheme</label>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 cursor-pointer border-2 border-blue-600"></div>
                    <div className="w-6 h-6 rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-500 cursor-pointer"></div>
                    <div className="w-6 h-6 rounded-full bg-orange-500 cursor-pointer"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language & Region
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm">Português (BR)</Button>
                    <Button variant="outline" size="sm">English</Button>
                    <Button variant="outline" size="sm">Español</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <div className="text-sm text-muted-foreground">
                    America/Sao_Paulo (UTC-3)
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <div className="text-sm text-muted-foreground">
                    DD/MM/YYYY
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show Live Scores</div>
                    <div className="text-sm text-muted-foreground">
                      Display live match scores in real-time
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-refresh</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically refresh live match data
                    </div>
                  </div>
                  <Button variant="outline" size="sm">30s</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compact View</div>
                    <div className="text-sm text-muted-foreground">
                      Show more matches in less space
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Type</label>
                  <Badge variant="default">Free User</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subscription</label>
                  <div className="text-sm text-muted-foreground">
                    No active subscription
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Match Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Live Match Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified when matches start, goals are scored
                    </div>
                  </div>
                  <Button variant="default" size="sm">On</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Match Results</div>
                    <div className="text-sm text-muted-foreground">
                      Receive final scores and match summaries
                    </div>
                  </div>
                  <Button variant="default" size="sm">On</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Upcoming Matches</div>
                    <div className="text-sm text-muted-foreground">
                      Reminders for matches starting soon
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Off</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Betting Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">High Confidence Tips</div>
                    <div className="text-sm text-muted-foreground">
                      Alerts for predictions with 80%+ confidence
                    </div>
                  </div>
                  <Button variant="default" size="sm">On</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Value Bets</div>
                    <div className="text-sm text-muted-foreground">
                      Notifications for high-value betting opportunities
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Off</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Market Trends</div>
                    <div className="text-sm text-muted-foreground">
                      Updates on hot and cold betting trends
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Off</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Browser Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Show notifications in your browser
                    </div>
                  </div>
                  <Button variant="default" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Send updates to your email address
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sound Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Play sound for important notifications
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Do Not Disturb</label>
                  <div className="text-sm text-muted-foreground">
                    22:00 - 08:00 (Local Time)
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekend Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Reduced notifications on weekends
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">FootyStats API</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Connected</Badge>
                    <span className="text-sm text-muted-foreground">
                      Last sync: 2 minutes ago
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Usage</label>
                  <div className="text-sm text-muted-foreground">
                    1,247 / 10,000 requests today
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '12.47%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Refresh Rate</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Real-time</Button>
                    <Button variant="default" size="sm">30s</Button>
                    <Button variant="outline" size="sm">1min</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Analytics</div>
                    <div className="text-sm text-muted-foreground">
                      Help improve the app with usage data
                    </div>
                  </div>
                  <Button variant="default" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Crash Reports</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically send error reports
                    </div>
                  </div>
                  <Button variant="default" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Data Export</div>
                    <div className="text-sm text-muted-foreground">
                      Download your data and preferences
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache & Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Local Storage</label>
                  <div className="text-sm text-muted-foreground">
                    2.3 MB used for offline data
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cache Duration</label>
                  <div className="text-sm text-muted-foreground">
                    Match data cached for 5 minutes
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Clear Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Sync</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Backup</div>
                    <div className="text-sm text-muted-foreground">
                      Backup settings and preferences
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Backup</label>
                  <div className="text-sm text-muted-foreground">
                    Never
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Create Backup Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version</label>
                  <div className="text-sm text-muted-foreground">1.0.0</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Build</label>
                  <div className="text-sm text-muted-foreground">2024.01.15</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <div className="text-sm text-muted-foreground">Next.js 15.3.3</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Source</label>
                  <div className="text-sm text-muted-foreground">FootyStats API</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support & Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full">
                  Send Feedback
                </Button>
                <Button variant="outline" className="w-full">
                  Report Bug
                </Button>
                <Button variant="outline" className="w-full">
                  Feature Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="ghost" className="w-full justify-start p-0">
                  Terms of Service
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0">
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0">
                  Cookie Policy
                </Button>
                <Button variant="ghost" className="w-full justify-start p-0">
                  Licenses
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <div className="font-medium">Developed by</div>
                  <div className="text-muted-foreground">Odd Genius Team</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Data Provided by</div>
                  <div className="text-muted-foreground">FootyStats.org</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">UI Components</div>
                  <div className="text-muted-foreground">Shadcn/ui</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Icons</div>
                  <div className="text-muted-foreground">Lucide React</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
