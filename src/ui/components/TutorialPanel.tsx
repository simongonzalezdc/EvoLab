import React, { useState } from 'react';

interface TutorialStep {
  title: string;
  content: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to EvoLab!',
    content: `EvoLab is an evolution simulator where you guide a cell through survival and reproduction.

Your goal is to survive, collect resources, and evolve through generations by modifying traits.`,
  },
  {
    title: 'Basic Controls',
    content: `Movement: Use WASD or Arrow Keys to move your cell around the lake.

Mouse: Click and drag to pan the camera view.

The camera automatically follows your cell as you move.`,
  },
  {
    title: 'Energy & Survival',
    content: `ATP Energy: Your cell consumes ATP constantly. When it reaches zero, you die.

Resources: Collect green glucose particles to restore ATP.

Compounds: Collect amino acids (blue) and phosphates (yellow) for reproduction.`,
  },
  {
    title: 'Biomes & Environment',
    content: `The lake has 7 different biomes, each with unique properties:
- Shallow Warm: Rich in glucose
- Deep Cold: Slower movement
- Toxic: Damages health over time
- Nutrient Rich: Extra resources

Day/Night Cycle: Light levels affect visibility and resource availability.`,
  },
  {
    title: 'Traits & Evolution',
    content: `Your cell has 55+ genetic traits including:
- Size, Speed, Strength
- Intelligence, Senses
- Photosynthesis, Toxin Production
- Armor, Camouflage

Each trait affects your survival and capabilities.`,
  },
  {
    title: 'Reproduction',
    content: `Requirements:
- 100 Glucose
- 50 Amino Acids
- 30 Phosphates
- 50 ATP

When ready, you'll see the Trait Editor where you can spend DNA points to modify your offspring's traits.

Mutations: Random changes occur naturally, driving evolution.`,
  },
  {
    title: 'AI Species',
    content: `You're not alone! Three AI species compete for survival:

Herbivores (Green): Peaceful, gather resources, flee from danger.

Carnivores (Red): Aggressive predators that hunt other cells.

Omnivores (Yellow): Balanced species that gather and hunt opportunistically.`,
  },
  {
    title: 'Combat System',
    content: `Combat occurs when cells collide:
- Damage = (Size × 0.5) + (Toxin × 0.5)
- Armor reduces incoming damage by 10% per point
- Speed helps you escape predators
- Size makes you harder to kill but slower`,
  },
  {
    title: 'Data Visualization',
    content: `Track your progress with charts:
- Population Graph: See species populations over time
- Evolution Tree: View your lineage
- Trait Radar: Analyze your trait profile

Export your best creatures to save them!`,
  },
  {
    title: 'Time Controls',
    content: `Control simulation speed:
- 1x: Normal speed
- 10x: Fast forward
- 100x: Very fast
- 1000x: Ultra fast

Pause: Stop time completely
Step: Advance one frame at a time for detailed analysis`,
  },
  {
    title: 'Tips for Success',
    content: `1. Balance your traits - don't max out everything
2. Adapt to your environment's biome
3. Avoid carnivores early on
4. Photosynthesis can provide passive energy
5. Save successful creatures for later
6. Experiment with different strategies!

Good luck, and may evolution be with you!`,
  },
];

interface TutorialPanelProps {
  onClose: () => void;
}

export const TutorialPanel: React.FC<TutorialPanelProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];

  if (!step) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '2px solid #60a5fa',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Indicator */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#888', fontSize: '12px' }}>
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span style={{ color: '#888', fontSize: '12px' }}>
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px' }}>
            <div
              style={{
                width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                height: '100%',
                background: '#60a5fa',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <h2 style={{ margin: '0 0 20px 0', color: '#60a5fa', fontSize: '24px' }}>{step.title}</h2>
        <div
          style={{
            color: '#ddd',
            fontSize: '16px',
            lineHeight: '1.6',
            whiteSpace: 'pre-line',
            minHeight: '200px',
          }}
        >
          {step.content}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              padding: '10px 20px',
              background: currentStep === 0 ? '#333' : '#555',
              color: currentStep === 0 ? '#666' : '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              style={{
                padding: '10px 20px',
                background: '#60a5fa',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>

        {/* Quick Navigation Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentStep ? '#60a5fa' : '#333',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
