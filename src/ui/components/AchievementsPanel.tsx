import React, { useState } from 'react';
import FocusLock from 'react-focus-lock';
import type { Achievement, Challenge } from '../../achievements/AchievementSystem';
import { AchievementCategory } from '../../achievements/AchievementSystem';

interface AchievementsPanelProps {
  achievements: Achievement[];
  challenges: Challenge[];
  onClose: () => void;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  challenges,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'challenges'>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  // Handle ESC key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const categories: (AchievementCategory | 'all')[] = [
    'all',
    AchievementCategory.SURVIVAL,
    AchievementCategory.EVOLUTION,
    AchievementCategory.COMBAT,
    AchievementCategory.EXPLORATION,
    AchievementCategory.TRAITS,
    AchievementCategory.CHALLENGES,
  ];

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'uncommon':
        return '#10b981';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      case 'extreme':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <FocusLock returnFocus>
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '2px solid #60a5fa',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <h2
              id="achievements-title"
              style={{
                margin: '0 0 10px 0',
                color: '#fff',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            🏆 Achievements & Challenges
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '15px',
            }}
          >
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              Progress: {unlockedCount}/{totalCount}
            </span>
            <div
              style={{
                flex: 1,
                height: '8px',
                background: '#334155',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${completionPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' }}>
              {completionPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setSelectedTab('achievements')}
            style={{
              flex: 1,
              padding: '12px',
              background:
                selectedTab === 'achievements'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                  : '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            Achievements
          </button>
          <button
            onClick={() => setSelectedTab('challenges')}
            style={{
              flex: 1,
              padding: '12px',
              background:
                selectedTab === 'challenges'
                  ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                  : '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            Challenges
          </button>
        </div>

        {/* Category Filter (Achievements only) */}
        {selectedTab === 'achievements' && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 16px',
                  background: selectedCategory === category ? '#3b82f6' : '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          {selectedTab === 'achievements' ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  style={{
                    background: achievement.unlocked
                      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                      : '#1e293b',
                    border: `2px solid ${achievement.unlocked ? getRarityColor(achievement.rarity) : '#475569'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: achievement.unlocked ? 1 : achievement.hidden ? 0.3 : 0.6,
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
                    }}
                  >
                    {achievement.hidden && !achievement.unlocked ? '❓' : achievement.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4
                        style={{
                          margin: 0,
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }}
                      >
                        {achievement.hidden && !achievement.unlocked
                          ? '???'
                          : achievement.name}
                      </h4>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: getRarityColor(achievement.rarity),
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                        }}
                      >
                        {achievement.rarity}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 8px 0', color: '#9ca3af', fontSize: '13px' }}>
                      {achievement.hidden && !achievement.unlocked
                        ? 'Secret achievement'
                        : achievement.description}
                    </p>
                    {!achievement.unlocked && !achievement.hidden && (
                      <div style={{ marginTop: '8px' }}>
                        <div
                          style={{
                            height: '6px',
                            background: '#334155',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${(achievement.progress / achievement.requirement) * 100}%`,
                              height: '100%',
                              background: getRarityColor(achievement.rarity),
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                          {achievement.progress} / {achievement.requirement}
                        </span>
                      </div>
                    )}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span style={{ fontSize: '11px', color: '#10b981' }}>
                        ✓ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {challenges.map(challenge => (
                <div
                  key={challenge.id}
                  style={{
                    background: challenge.completed
                      ? 'linear-gradient(135deg, #1e3a20 0%, #2d5a2f 100%)'
                      : challenge.active
                        ? 'linear-gradient(135deg, #3a1e1e 0%, #5a2d2d 100%)'
                        : '#1e293b',
                    border: `2px solid ${challenge.completed ? '#10b981' : challenge.active ? '#ef4444' : '#475569'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    opacity: challenge.completed ? 0.8 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <h4
                        style={{
                          margin: '0 0 4px 0',
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }}
                      >
                        {challenge.name}
                      </h4>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: getDifficultyColor(challenge.difficulty),
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                        }}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>
                        {challenge.reward.description}
                      </div>
                      {challenge.timeLimit && (
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                          ⏱ {challenge.timeLimit}s
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: '8px 0', color: '#9ca3af', fontSize: '13px' }}>
                    {challenge.description}
                  </p>
                  {challenge.active && (
                    <div style={{ marginTop: '8px' }}>
                      <div
                        style={{
                          height: '6px',
                          background: '#334155',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${(challenge.progress / challenge.target) * 100}%`,
                            height: '100%',
                            background: '#ef4444',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        {challenge.progress} / {challenge.target}
                      </span>
                    </div>
                  )}
                  {challenge.completed && (
                    <span style={{ fontSize: '11px', color: '#10b981' }}>✓ Completed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          Close
        </button>
        </div>
      </FocusLock>
    </div>
  );
};
