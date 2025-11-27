/**
 * Game Results Routes
 * Handles saving and retrieving mini-game results
 */

const express = require('express')
const router = express.Router()
const db = require('../db')

// Save game result
router.post('/results', async (req, res) => {
  try {
    const {
      gameType,
      score,
      level,
      duration,
      accuracy,
      metadata,
      userId,
      sessionId
    } = req.body

    // Validate required fields
    if (!gameType || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Game type and score are required'
      })
    }

    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store game result
    const stmt = db.prepare(`
      INSERT INTO game_results (
        game_id, user_id, session_id, game_type, 
        score, level, duration, accuracy, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)

    stmt.run(
      gameId,
      userId || null,
      sessionId || null,
      gameType,
      score,
      level || 1,
      duration || 0,
      accuracy || 0,
      JSON.stringify(metadata || {})
    )

    // Calculate percentile ranking
    const ranking = calculatePercentile(gameType, score)

    res.json({
      success: true,
      gameId,
      ranking,
      message: 'Game result saved successfully'
    })

  } catch (error) {
    console.error('Save game result error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to save game result',
      error: error.message
    })
  }
})

// Get game results
router.get('/results', async (req, res) => {
  try {
    const { userId, gameType, limit = 50 } = req.query

    let query = `
      SELECT * FROM game_results 
      WHERE 1=1
    `
    const params = []

    if (userId) {
      query += ` AND user_id = ?`
      params.push(userId)
    }

    if (gameType) {
      query += ` AND game_type = ?`
      params.push(gameType)
    }

    query += ` ORDER BY created_at DESC LIMIT ?`
    params.push(parseInt(limit))

    const results = db.prepare(query).all(...params)

    const parsedResults = results.map(result => ({
      ...result,
      metadata: JSON.parse(result.metadata || '{}')
    }))

    res.json({
      success: true,
      results: parsedResults
    })

  } catch (error) {
    console.error('Get game results error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game results',
      error: error.message
    })
  }
})

// Get leaderboard
router.get('/leaderboard/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params
    const { limit = 10, timeframe = 'all' } = req.query

    let query = `
      SELECT 
        user_id,
        MAX(score) as best_score,
        COUNT(*) as games_played,
        AVG(score) as avg_score,
        MAX(created_at) as last_played
      FROM game_results 
      WHERE game_type = ?
    `
    const params = [gameType]

    // Add timeframe filter
    if (timeframe === 'week') {
      query += ` AND created_at >= datetime('now', '-7 days')`
    } else if (timeframe === 'month') {
      query += ` AND created_at >= datetime('now', '-30 days')`
    }

    query += `
      GROUP BY user_id 
      ORDER BY best_score DESC 
      LIMIT ?
    `
    params.push(parseInt(limit))

    const leaderboard = db.prepare(query).all(...params)

    // Add rankings
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      percentile: calculatePercentile(gameType, entry.best_score)
    }))

    res.json({
      success: true,
      leaderboard: rankedLeaderboard,
      gameType,
      timeframe
    })

  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    })
  }
})

// Get game statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const stats = {
      totalGames: 0,
      gamesByType: {},
      bestScores: {},
      averageScores: {},
      recentActivity: [],
      achievements: []
    }

    // Get total games
    const totalResult = db.prepare(`
      SELECT COUNT(*) as count FROM game_results WHERE user_id = ?
    `).get(userId)
    stats.totalGames = totalResult.count

    // Get games by type with scores
    const typeResults = db.prepare(`
      SELECT 
        game_type, 
        COUNT(*) as count,
        MAX(score) as best_score,
        AVG(score) as avg_score
      FROM game_results 
      WHERE user_id = ? 
      GROUP BY game_type
    `).all(userId)
    
    typeResults.forEach(row => {
      stats.gamesByType[row.game_type] = row.count
      stats.bestScores[row.game_type] = row.best_score
      stats.averageScores[row.game_type] = Math.round(row.avg_score * 100) / 100
    })

    // Get recent activity
    const recentResults = db.prepare(`
      SELECT game_type, score, created_at 
      FROM game_results 
      WHERE user_id = ? 
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId)
    stats.recentActivity = recentResults

    // Generate achievements
    stats.achievements = generateAchievements(userId, typeResults)

    res.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get game stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game statistics',
      error: error.message
    })
  }
})

// Helper functions
function calculatePercentile(gameType, score) {
  try {
    // Get all scores for this game type
    const allScores = db.prepare(`
      SELECT score FROM game_results WHERE game_type = ? ORDER BY score ASC
    `).all(gameType).map(row => row.score)

    if (allScores.length === 0) return 50

    // Find percentile
    const position = allScores.findIndex(s => s >= score)
    if (position === -1) return 100

    return Math.round((position / allScores.length) * 100)
  } catch (error) {
    console.error('Percentile calculation error:', error)
    return 50
  }
}

function generateAchievements(userId, gameStats) {
  const achievements = []

  gameStats.forEach(game => {
    // First game achievement
    if (game.count >= 1) {
      achievements.push({
        id: `first_${game.game_type}`,
        title: `First ${game.game_type} Game`,
        description: `Played your first ${game.game_type} game`,
        icon: '🎯',
        unlocked: true
      })
    }

    // High score achievements
    if (game.best_score >= 1000) {
      achievements.push({
        id: `high_score_${game.game_type}`,
        title: `${game.game_type} Master`,
        description: `Scored over 1000 points in ${game.game_type}`,
        icon: '🏆',
        unlocked: true
      })
    }

    // Consistency achievements
    if (game.count >= 10 && game.avg_score >= 500) {
      achievements.push({
        id: `consistent_${game.game_type}`,
        title: `Consistent Player`,
        description: `Maintained high average in ${game.game_type}`,
        icon: '⭐',
        unlocked: true
      })
    }
  })

  return achievements
}

module.exports = router
