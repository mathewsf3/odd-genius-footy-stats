"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  // Users,
  Flag,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap
} from "lucide-react";

export default function BettingInsightsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Betting Insights</h1>
        <p className="text-muted-foreground">
          Professional betting analysis and predictions for Brazilian soccer
        </p>
      </div>

      {/* Today's Top Picks */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Today&apos;s Top Picks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Flamengo vs Palmeiras</span>
                <Badge variant="default">High Confidence</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Over 2.5 Goals</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">85%</span>
                <span className="text-sm">confidence</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">São Paulo vs Corinthians</span>
                <Badge variant="secondary">Medium</Badge>
              </div>
              <div className="text-sm text-muted-foreground">BTTS Yes</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">72%</span>
                <span className="text-sm">confidence</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Grêmio vs Internacional</span>
                <Badge variant="outline">Low Risk</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Under 3.5 Goals</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-purple-600">68%</span>
                <span className="text-sm">confidence</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8W</div>
            <p className="text-xs text-muted-foreground">
              Current winning streak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="space-y-4">
            {[
              {
                match: "Flamengo vs Palmeiras",
                league: "Brasileirão",
                time: "20:00",
                prediction: "Over 2.5 Goals",
                confidence: 85,
                odds: 1.75,
                reasoning: "Both teams average 2.8 goals per match in recent fixtures"
              },
              {
                match: "São Paulo vs Corinthians",
                league: "Brasileirão", 
                time: "18:30",
                prediction: "BTTS Yes",
                confidence: 72,
                odds: 1.65,
                reasoning: "Derby matches typically see both teams score"
              },
              {
                match: "Grêmio vs Internacional",
                league: "Brasileirão",
                time: "16:00", 
                prediction: "Under 3.5 Goals",
                confidence: 68,
                odds: 1.55,
                reasoning: "Defensive-minded teams with low-scoring recent history"
              }
            ].map((prediction, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{prediction.match}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="h-3 w-3" />
                        <span>{prediction.league}</span>
                        <span>•</span>
                        <span>{prediction.time}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={prediction.confidence >= 80 ? "default" : prediction.confidence >= 70 ? "secondary" : "outline"}
                    >
                      {prediction.confidence >= 80 ? "High" : prediction.confidence >= 70 ? "Medium" : "Low"} Confidence
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Prediction</div>
                      <div className="font-semibold">{prediction.prediction}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-semibold">{prediction.confidence}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Odds</div>
                      <div className="font-semibold">{prediction.odds}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <strong>Analysis:</strong> {prediction.reasoning}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="markets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Profitable Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Over/Under Goals</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">+15.2%</Badge>
                      <span className="text-sm text-green-600">ROI</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Both Teams to Score</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">+12.8%</Badge>
                      <span className="text-sm text-green-600">ROI</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Asian Handicap</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">+8.5%</Badge>
                      <span className="text-sm text-blue-600">ROI</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Corners</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">+6.2%</Badge>
                      <span className="text-sm text-blue-600">ROI</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Success Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Over 2.5 Goals</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>BTTS Yes</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '74%'}}></div>
                      </div>
                      <span className="text-sm font-medium">74%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Over 9.5 Corners</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '69%'}}></div>
                      </div>
                      <span className="text-sm font-medium">69%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Match Result</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
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
                  Hot Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">HOT</Badge>
                    <span className="text-sm">Over 2.5 in Brasileirão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">HOT</Badge>
                    <span className="text-sm">BTTS in Derby matches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">WARM</Badge>
                    <span className="text-sm">High corners in Copa do Brasil</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Cold Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">COLD</Badge>
                    <span className="text-sm">Under 1.5 goals trending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">COLD</Badge>
                    <span className="text-sm">Away wins decreasing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">COOL</Badge>
                    <span className="text-sm">Low card counts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  League Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">Brasileirão</div>
                    <div className="text-muted-foreground">High-scoring league</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Copa do Brasil</div>
                    <div className="text-muted-foreground">Defensive matches</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">State Championships</div>
                    <div className="text-muted-foreground">Unpredictable results</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Betting Strategy Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Focus on Value</div>
                      <div className="text-sm text-muted-foreground">
                        Look for odds that don't match the true probability
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Bankroll Management</div>
                      <div className="text-sm text-muted-foreground">
                        Never bet more than 2-5% of your total bankroll
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Research Teams</div>
                      <div className="text-sm text-muted-foreground">
                        Study recent form, injuries, and head-to-head records
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Avoid Emotional Betting</div>
                      <div className="text-sm text-muted-foreground">
                        Don't bet on your favorite team with bias
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Set Limits</div>
                      <div className="text-sm text-muted-foreground">
                        Establish daily, weekly, and monthly betting limits
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Track Performance</div>
                      <div className="text-sm text-muted-foreground">
                        Keep detailed records of all your bets and results
                      </div>
                    </div>
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
