import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Film, Tv2, BookOpen, Sparkles, ArrowRight, Link as LinkIcon } from 'lucide-react';

import '../../App.css';

function RadialOrbitalTimeline() {
  const [expandedItems, setExpandedItems] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [centerOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  const getRouteForCategory = (category) => {
    switch (category) {
      case 'Movies':
        return '/movies';
      case 'Web Series':
        return '/webseries';
      case 'Anime':
        return '/anime';
      case 'Manga':
        return '/manga';
      default:
        return '/';
    }
  };

  const timelineData = [
    {
      id: 1,
      title: 'Movies',
      content:
        'Discover cinematic worlds that match your favorite pacing, tone, and character arcs across thousands of films.',
      category: 'Movies',
      icon: Film,
      relatedIds: [2, 3],
      status: 'completed',
      energy: 95,
    },
    {
      id: 2,
      title: 'Web Series',
      content:
        'Find long-form stories across platforms that continue the same vibes, cliffhangers, and ensemble chemistry you love.',
      category: 'Web Series',
      icon: Tv2,
      relatedIds: [1, 3, 4],
      status: 'in-progress',
      energy: 80,
    },
    {
      id: 3,
      title: 'Anime',
      content:
        'Bridge into anime series and films that share visual style, emotional beats, and power systems with your watchlist.',
      category: 'Anime',
      icon: Sparkles,
      relatedIds: [1, 2, 4],
      status: 'in-progress',
      energy: 70,
    },
    {
      id: 4,
      title: 'Manga',
      content:
        'Jump into printed stories that extend or inspire your favorite shows and anime, with connected arcs and worlds.',
      category: 'Manga',
      icon: BookOpen,
      relatedIds: [2, 3],
    status: 'pending',
      energy: 55,
    },
  ];

  const getRelatedItems = (itemId) => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const centerViewOnNode = (nodeId) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key, 10) !== id) {
          newState[parseInt(key, 10)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate]);

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    // Match the visual CSS ring (380px diameter => 190px radius)
    const radius = 190;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, zIndex, opacity };
  };

  return (
    <div
      className="orbital-timeline-container"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="orbital-timeline-orbit-wrapper" ref={orbitRef}>
        <div className="orbital-timeline-core">
          <div className="orbital-timeline-core-inner" />
        </div>

        <div className="orbital-timeline-ring" />

        {timelineData.map((item, index) => {
          const position = calculateNodePosition(index, timelineData.length);
          const isExpanded = expandedItems[item.id];
          const isPulsing = pulseEffect[item.id];
          const Icon = item.icon;

          // Position the node center exactly on the ring by translating
          // from the center of the orbit wrapper (50%, 50%) and then
          // offsetting by half the node size (20px) so the icon sits on the line.
          const nodeStyle = {
            transform: `translate(calc(50% + ${position.x}px - 20px), calc(50% + ${position.y}px - 20px))`,
            zIndex: isExpanded ? 200 : position.zIndex,
            opacity: isExpanded ? 1 : position.opacity,
          };

          return (
            <div
              key={item.id}
              ref={(el) => (nodeRefs.current[item.id] = el)}
              className="orbital-timeline-node-wrapper"
              style={nodeStyle}
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              <div
                className={`orbital-timeline-node-glow ${
                  isPulsing ? 'orbital-pulse' : ''
                }`}
              />

              <div
                className={`orbital-timeline-node ${
                  isExpanded
                    ? 'orbital-node-expanded'
                    : 'orbital-node-default'
                }`}
              >
                <Icon size={16} />
              </div>

              <div
                className={`orbital-timeline-node-title ${
                  isExpanded ? 'orbital-title-expanded' : ''
                }`}
              >
                {item.title}
              </div>

              {isExpanded && (
                <div className="orbital-timeline-card">
                  <div className="orbital-timeline-card-title">{item.title}</div>
                  <p className="orbital-timeline-card-content">{item.content}</p>
                  <div className="orbital-card-actions">
                    <RouterLink
                      to={getRouteForCategory(item.category)}
                      className="orbital-card-button"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View {item.title} recommendations
                      <ArrowRight size={12} style={{ marginLeft: 6 }} />
                    </RouterLink>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RadialOrbitalTimeline;
