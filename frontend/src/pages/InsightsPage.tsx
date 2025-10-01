import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { insightsApi } from '../lib/api';
import { Insight } from '../types/api';
import { formatRelativeTime } from '../lib/utils';

export function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsApi.getAll();
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await insightsApi.generate();
      await loadInsights();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      await insightsApi.dismiss(id);
      setInsights(insights.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription': return '🔄';
      case 'anomaly': return '⚠️';
      case 'trend': return '📈';
      case 'opportunity': return '💰';
      default: return '💡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subscription': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'anomaly': return 'bg-red-50 text-red-700 border-red-200';
      case 'trend': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'opportunity': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const activeInsights = insights.filter(i => !i.dismissedAt);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered analysis of your spending patterns
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} size="lg">
          {generating ? 'Analyzing...' : 'Generate New Insights'}
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading insights...</div>
          </CardContent>
        </Card>
      ) : activeInsights.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Insights Yet</CardTitle>
            <CardDescription>
              Generate insights to discover patterns in your spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="font-semibold mb-2">Ready to analyze your spending?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will identify subscriptions, anomalies, trends, and opportunities to save
              </p>
              <Button size="lg" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeInsights.map((insight) => (
            <Card key={insight.id} className={`border ${getTypeColor(insight.type)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getTypeIcon(insight.type)}</span>
                    <div>
                      <CardTitle className="capitalize">{insight.type}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatRelativeTime(insight.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(insight.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {insight.insight}
                </p>
                {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Details:</p>
                    <div className="text-xs space-y-1">
                      {Object.entries(insight.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights.filter(i => i.dismissedAt).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dismissed Insights</CardTitle>
            <CardDescription>
              Previously dismissed insights ({insights.filter(i => i.dismissedAt).length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.filter(i => i.dismissedAt).map((insight) => (
                <div key={insight.id} className="p-3 bg-muted/50 rounded-lg opacity-60">
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(insight.type)}</span>
                    <span className="text-sm capitalize font-medium">{insight.type}</span>
                    <span className="text-xs text-muted-foreground">
                      - {insight.insight.substring(0, 100)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
