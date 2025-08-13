import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IconBrandSafari, 
  IconBriefcase, 
  IconList, 
  IconPigMoney, 
  IconUsers, 
  IconSettings, 
  IconBook2, 
  IconMoodEmpty,
  IconMoodPlus,
  IconCoins,
  IconCamera
} from '@tabler/icons-react';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  type MenuItem = {
    icon?: React.ReactNode;
    text?: string;
    path?: string;
    type?: 'divider';
  };

  const menuItems: MenuItem[] = [
    {
      icon: <IconBrandSafari className="w-5.5 h-5.5" />,
      text: 'Discover',
      path: '/discover'
    },
    {
      icon: <IconMoodEmpty className="w-5.5 h-5.5" />,
      text: 'Emojis',
      path: '/emojis'
    },
    {
      icon: <IconCoins className="w-5.5 h-5.5" />,
      text: 'Tokens',
      path: '/tokens'
    },
    {
      icon: <IconCamera className="w-5.5 h-5.5" />,
      text: 'Photos',
      path: '/photos'
    },
    {
      icon: <IconBriefcase className="w-5.5 h-5.5" />,
      text: 'Portfolio',
      path: '/portfolio'
    },
    {
      icon: <IconList className="w-5.5 h-5.5" />,
      text: 'Activity',
      path: '/activity'
    },
    {
      icon: <IconPigMoney className="w-5.5 h-5.5" />,
      text: 'Rewards',
      path: '/rewards'
    },
    {
      icon: <IconUsers className="w-5.5 h-5.5" />,
      text: 'Cult',
      path: '/cult'
    },
    {
      icon: <IconMoodPlus className="w-5.5 h-5.5" />,
      text: 'Studio',
      path: '/studio'
    },
    {
      type: 'divider'
    },
    {
      icon: <IconBook2 className="w-5.5 h-5.5" />,
      text: 'Docs',
      path: '/docs'
    },
    {
      icon: <IconSettings className="w-5.5 h-5.5" />,
      text: 'Settings',
      path: '/settings'
    }
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    // Immediately lock and retract the sidebar after navigation
    setIsLocked(true);
    setIsExpanded(false);
  };

  const handleMouseEnter = () => {
    // Only expand if not locked
    if (!isLocked) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      setIsExpanded(false);
    }
    // Unlock when cursor moves away from sidebar
    if (isLocked) {
      setIsLocked(false);
    }
  };

  const handleClick = () => {
    if (isExpanded) {
      setIsLocked(true);
      setIsExpanded(false);
    }
  };

  // Get current page from location
  const currentPath = location.pathname.split('/')[1] || 'discover';

  return (
    <div 
      className={`fixed left-0 top-0 h-full backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out z-[9999] ${
        isExpanded ? 'w-48' : 'w-[52px]'
      } overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand Section */}
        <div className="flex items-center h-16 px-4 mt-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 -ml-1">
            <img 
              src="/src/assets/logo/300ppi/glayze logo@300x.png" 
              alt="Glayze Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className={`text-primary text-2xl whitespace-nowrap select-none transition-all duration-300 font-['Circular_Std_Medium'] ${isExpanded ? 'opacity-100 ml-2 w-auto' : 'opacity-0 ml-0 w-0'}`}>
            Glayze
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <div className="flex h-full">
            <ul className="flex flex-col gap-y-2 w-full mt-2">
              {menuItems.map((item, index) => {
                // Skip rendering for divider items
                if (item.type === 'divider') {
                  return (
                    <li key={index}>
                      <div className="h-px bg-white/10 mx-2 my-2"></div>
                    </li>
                  );
                }

                const isActive = currentPath === item.path?.split('/')[1];
                const indicatorWidth = isExpanded ? 'w-[80%] ml-2' : 'w-8 ml-2';
                return (
                  <li key={index}>
                    <div
                      className={`relative flex flex-row items-center w-full h-10 cursor-pointer transition-colors duration-200
                         ${isActive ? 'text-primary' : 'text-text/70'}
                         hover:text-primary`
                       }
                      onClick={() => handleItemClick(item.path!)}
                    >
                      {/* Active/Hover Indicator */}
                      <div
                        className={`absolute left-0 top-0 h-10 rounded-lg -z-10 transition-all duration-200 ${indicatorWidth} ${
                          (isActive ? 'bg-primary/10' : '')
                        }`}
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-10 z-10">
                        {item.icon}
                      </div>
                      <span className={`text-sm font-medium whitespace-nowrap select-none overflow-hidden transition-all duration-300 z-10 ${isExpanded ? 'opacity-100 ml-2 w-auto' : 'opacity-0 ml-0 w-0'}`} style={{ minWidth: 0 }}>
                        {item.text}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
} 