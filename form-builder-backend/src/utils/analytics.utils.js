// Analytics module for generating insights from form responses
const Response = require('../models/response.model');

// Get sentiment statistics
async function getSentimentStats(formId) {
  try {
    const responses = await Response.find({
      formId,
      'sentiment.label': { $ne: null }
    });

    const stats = {
      total: responses.length,
      POSITIVE: 0,
      NEGATIVE: 0,
      NEUTRAL: 0,
      averageScore: 0,
      trend: null
    };

    let totalScore = 0;
    responses.forEach(r => {
      if (r.sentiment && r.sentiment.label) {
        stats[r.sentiment.label]++;
        totalScore += r.sentiment.score || 0;
      }
    });

    if (responses.length > 0) {
      stats.averageScore = (totalScore / responses.length).toFixed(2);
      stats.percentages = {
        positive: ((stats.POSITIVE / responses.length) * 100).toFixed(1),
        negative: ((stats.NEGATIVE / responses.length) * 100).toFixed(1),
        neutral: ((stats.NEUTRAL / responses.length) * 100).toFixed(1)
      };
    }

    // Calculate trend (compare recent to older)
    if (responses.length >= 10) {
      const recent = responses.slice(-5);
      const older = responses.slice(-10, -5);
      
      const recentPos = recent.filter(r => r.sentiment.label === 'POSITIVE').length;
      const olderPos = older.filter(r => r.sentiment.label === 'POSITIVE').length;
      
      if (recentPos > olderPos) {
        stats.trend = 'improving';
      } else if (recentPos < olderPos) {
        stats.trend = 'declining';
      } else {
        stats.trend = 'stable';
      }
    }

    return stats;
  } catch (error) {
    console.error('Sentiment Stats Error:', error.message);
    return null;
  }
}

// Get spam statistics
async function getSpamStats(formId) {
  try {
    const responses = await Response.find({ formId });

    const stats = {
      total: responses.length,
      spamCount: 0,
      averageSpamScore: 0,
      flaggedForReview: []
    };

    let totalSpamScore = 0;
    responses.forEach(r => {
      if (r.isSpam) {
        stats.spamCount++;
      }
      totalSpamScore += r.spamScore || 0;

      // Flag responses with spam score > 0.3
      if (r.spamScore > 0.3) {
        stats.flaggedForReview.push({
          id: r._id,
          spamScore: r.spamScore,
          createdAt: r.createdAt
        });
      }
    });

    stats.averageSpamScore = responses.length > 0 
      ? (totalSpamScore / responses.length).toFixed(3)
      : 0;

    stats.spamPercentage = responses.length > 0
      ? ((stats.spamCount / responses.length) * 100).toFixed(1)
      : 0;

    return stats;
  } catch (error) {
    console.error('Spam Stats Error:', error.message);
    return null;
  }
}

// Get quality statistics
async function getQualityStats(formId) {
  try {
    const responses = await Response.find({ formId });

    const stats = {
      total: responses.length,
      averageQualityScore: 0,
      highQuality: 0,
      mediumQuality: 0,
      lowQuality: 0
    };

    let totalQuality = 0;
    responses.forEach(r => {
      const score = r.qualityScore || 1;
      totalQuality += score;

      if (score >= 0.8) {
        stats.highQuality++;
      } else if (score >= 0.5) {
        stats.mediumQuality++;
      } else {
        stats.lowQuality++;
      }
    });

    if (responses.length > 0) {
      stats.averageQualityScore = (totalQuality / responses.length).toFixed(2);
      stats.distribution = {
        high: ((stats.highQuality / responses.length) * 100).toFixed(1),
        medium: ((stats.mediumQuality / responses.length) * 100).toFixed(1),
        low: ((stats.lowQuality / responses.length) * 100).toFixed(1)
      };
    }

    return stats;
  } catch (error) {
    console.error('Quality Stats Error:', error.message);
    return null;
  }
}

// Get top key phrases from responses
async function getTopPhrases(formId, limit = 10) {
  try {
    const responses = await Response.find({
      formId,
      keyPhrases: { $exists: true, $ne: [] }
    });

    const phraseFreq = {};
    responses.forEach(r => {
      if (r.keyPhrases && Array.isArray(r.keyPhrases)) {
        r.keyPhrases.forEach(phrase => {
          phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
        });
      }
    });

    const topPhrases = Object.entries(phraseFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([phrase, count]) => ({
        phrase,
        count,
        frequency: responses.length > 0 
          ? ((count / responses.length) * 100).toFixed(1)
          : 0
      }));

    return topPhrases;
  } catch (error) {
    console.error('Top Phrases Error:', error.message);
    return [];
  }
}

// Generate comprehensive analytics report
async function generateAnalyticsReport(formId) {
  try {
    const [sentimentStats, spamStats, qualityStats, topPhrases] = await Promise.all([
      getSentimentStats(formId),
      getSpamStats(formId),
      getQualityStats(formId),
      getTopPhrases(formId, 8)
    ]);

    return {
      generatedAt: new Date(),
      sentiment: sentimentStats,
      spam: spamStats,
      quality: qualityStats,
      topPhrases,
      summary: generateSummary(sentimentStats, spamStats, qualityStats)
    };
  } catch (error) {
    console.error('Analytics Report Error:', error.message);
    return null;
  }
}

// Generate human-readable summary
function generateSummary(sentimentStats, spamStats, qualityStats) {
  const summaries = [];

  // Sentiment summary
  if (sentimentStats && sentimentStats.total > 0) {
    const positive = sentimentStats.percentages?.positive || 0;
    if (positive > 60) {
      summaries.push(`🟢 Responses are highly positive (${positive}% positive)`);
    } else if (positive > 40) {
      summaries.push(`🟡 Responses are mixed (${positive}% positive)`);
    } else {
      summaries.push(`🔴 Responses are negative (${positive}% positive)`);
    }

    if (sentimentStats.trend) {
      summaries.push(`Trend: ${sentimentStats.trend.charAt(0).toUpperCase() + sentimentStats.trend.slice(1)}`);
    }
  }

  // Spam summary
  if (spamStats && spamStats.total > 0) {
    if (spamStats.spamPercentage > 10) {
      summaries.push(`⚠️ Detected ${spamStats.spamPercentage}% potential spam responses`);
    } else if (spamStats.spamPercentage > 0) {
      summaries.push(`✓ Low spam detection (${spamStats.spamPercentage}%)`);
    }
  }

  // Quality summary
  if (qualityStats && qualityStats.total > 0) {
    const avgQuality = qualityStats.averageQualityScore;
    if (avgQuality > 0.8) {
      summaries.push(`📊 High-quality responses (${(avgQuality * 100).toFixed(0)}% avg quality)`);
    } else if (avgQuality > 0.5) {
      summaries.push(`📊 Medium-quality responses (${(avgQuality * 100).toFixed(0)}% avg quality)`);
    } else {
      summaries.push(`📊 Low-quality responses (${(avgQuality * 100).toFixed(0)}% avg quality) - review needed`);
    }
  }

  return summaries;
}

// Get response timeline (responses over duration)
async function getResponseTimeline(formId, days = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const responses = await Response.find({
      formId,
      createdAt: { $gte: cutoffDate }
    }).sort({ createdAt: 1 });

    // Group by day
    const timeline = {};
    responses.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return Object.entries(timeline).map(([date, count]) => ({
      date,
      count,
      average: (count / days).toFixed(1)
    }));
  } catch (error) {
    console.error('Timeline Error:', error.message);
    return [];
  }
}

module.exports = {
  getSentimentStats,
  getSpamStats,
  getQualityStats,
  getTopPhrases,
  generateAnalyticsReport,
  getResponseTimeline
};
