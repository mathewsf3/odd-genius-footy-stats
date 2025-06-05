"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  Trophy, 
  Flag,
  Timer,
  Activity
} from "lucide-react";

export default function StatisticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Comprehensive soccer statistics and analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Goals/Match</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.7</div>
            <p className="text-xs text-muted-foreground">
              Across all leagues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTTS Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54%</div>
            <p className="text-xs text-muted-foreground">
              Both teams score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over 2.5 Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48%</div>
            <p className="text-xs text-muted-foreground">
              Matches with 3+ goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Corners</CardTitle>
            <Flag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10.2</div>
            <p className="text-xs text-muted-foreground">
              Per match
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="corners">Corners</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goals Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>0 Goals</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '8%'}}></div>
                      </div>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>1 Goal</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '18%'}}></div>
                      </div>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>2 Goals</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '26%'}}></div>
                      </div>
                      <span className="text-sm font-medium">26%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>3+ Goals</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '48%'}}></div>
                      </div>
                      <span className="text-sm font-medium">48%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>BTTS Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">54%</div>
                  <p className="text-muted-foreground">Matches with BTTS</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Home & Away Score</span>
                    <Badge variant="default">54%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Only Home Scores</span>
                    <Badge variant="secondary">23%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Only Away Scores</span>
                    <Badge variant="secondary">15%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>No Goals</span>
                    <Badge variant="outline">8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cards Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>0-2 Cards</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>3-4 Cards</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>5+ Cards</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">4.2</div>
                  <p className="text-muted-foreground">Cards per match</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Yellow Cards</span>
                    <span className="font-bold">3.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Red Cards</span>
                    <span className="font-bold">0.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home Team Avg</span>
                    <span className="font-bold">2.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away Team Avg</span>
                    <span className="font-bold">2.1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="corners" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Corners Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>0-8 Corners</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '20%'}}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>9-11 Corners</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>12+ Corners</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Corner Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">10.2</div>
                  <p className="text-muted-foreground">Average corners per match</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Home Team Avg</span>
                    <span className="font-bold">5.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away Team Avg</span>
                    <span className="font-bold">4.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Over 9.5 Rate</span>
                    <Badge variant="default">62%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Over 11.5 Rate</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Weekly Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Goals/Match</span>
                  <span className="font-bold text-green-500">↗ +0.3</span>
                </div>
                <div className="flex justify-between">
                  <span>BTTS Rate</span>
                  <span className="font-bold text-green-500">↗ +2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cards/Match</span>
                  <span className="font-bold text-red-500">↘ -0.2</span>
                </div>
                <div className="flex justify-between">
                  <span>Corners/Match</span>
                  <span className="font-bold text-green-500">↗ +0.5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  League Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Premier League</span>
                  <Badge variant="default">High</Badge>
                </div>
                <div className="flex justify-between">
                  <span>La Liga</span>
                  <Badge variant="default">High</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Bundesliga</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Serie A</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Most Goals</div>
                    <div className="text-muted-foreground">Manchester City vs Liverpool</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Most Corners</div>
                    <div className="text-muted-foreground">Barcelona vs Real Madrid</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Most Cards</div>
                    <div className="text-muted-foreground">Atletico vs Sevilla</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
