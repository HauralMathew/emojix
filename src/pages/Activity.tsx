import { useState, useEffect, useRef } from 'react';
import { IconClock } from '@tabler/icons-react';
import aptosLogo from '../assets/icons/Aptos_mark_WHT (1).png';
import movementLogo from '../assets/icons/movement-mark-reverse-rgb-2000px@72ppi.png';

export default function Activity() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'buy', label: 'Buy' },
    { id: 'sale', label: 'Sale' },
    { id: 'launch', label: 'Launch' }
  ];

  const timeOptions = [
    { value: '24h', label: '24 hours', icon: <IconClock className="w-4 h-4" /> },
    { value: '3d', label: '3 days', icon: <IconClock className="w-4 h-4" /> },
    { value: '7d', label: '7 days', icon: <IconClock className="w-4 h-4" /> },
    { value: '14d', label: '14 days', icon: <IconClock className="w-4 h-4" /> },
    { value: '30d', label: '30 days', icon: <IconClock className="w-4 h-4" /> },
    { value: '60d', label: '60 days', icon: <IconClock className="w-4 h-4" /> },
    { value: '90d', label: '90 days', icon: <IconClock className="w-4 h-4" /> },
    { value: 'all', label: 'All time', icon: <IconClock className="w-4 h-4" /> }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 mt-16">
      <div className="mx-auto px-2">
        {/* Header with Filter Buttons */}
        <div className="flex items-center justify-between mb-8">
          {/* Left: Filter Buttons */}
          <div className="flex items-center space-x-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 border ${
                  activeFilter === option.id
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface/20 text-text/70 hover:bg-surface/30 hover:text-text border-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Right: Filter Button, Tab Buttons, and Time Dropdown */}
          <div className="flex items-center space-x-2">


            {/* Tab Buttons */}
            <div className="flex items-center bg-surface/20 rounded-md p-1 border border-white/5">
              <button className="px-3 py-2 rounded-md bg-primary text-background text-sm font-medium">
                All
              </button>
              <button className="px-3 py-2 rounded-md text-text/70 hover:text-text text-sm font-medium">
                <img src={aptosLogo} alt="Aptos" className="w-4 h-4" />
              </button>
              <button className="px-3 py-2 rounded-md text-text/70 hover:text-text text-sm font-medium">
                <img src={movementLogo} alt="Movement" className="w-4 h-4" />
              </button>
            </div>

            {/* Time Dropdown */}
            <div className="relative" ref={timeDropdownRef}>
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="px-4 py-2 bg-surface/20 text-text rounded-md font-medium text-sm border border-white/5 focus:outline-none focus:border-primary/50 transition-all duration-200 flex items-center space-x-2 min-w-[120px]"
              >
                {timeOptions.find(opt => opt.value === timeRange)?.icon}
                <span>{timeOptions.find(opt => opt.value === timeRange)?.label}</span>
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showTimeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-surface/95 backdrop-blur-xl rounded-md border border-white/10 shadow-lg z-10">
                  {timeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimeRange(option.value);
                        setShowTimeDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-surface/30 transition-colors ${
                        timeRange === option.value ? 'bg-primary/20 text-primary' : 'text-text'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">Token</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">From</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">To</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text/80">Time</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {Array.from({ length: 10 }, (_, index) => {
                  const events = ['Buy', 'Sale', 'Launch', 'Transfer'];
                  const tokens = ['😀', '🚀', '🎉', '🌟', '🔥', '💎', '🌈', '⚡', '🎪', '🌙'];
                  const event = events[index % events.length];
                  const token = tokens[index % tokens.length];
                  const price = `${(Math.random() * 10 + 0.1).toFixed(3)} APT`;
                  const amount = `${(Math.random() * 1000 + 100).toFixed(0)}`;
                  const from = `0x${Math.random().toString(16).substr(2, 8)}...`;
                  const to = `0x${Math.random().toString(16).substr(2, 8)}...`;
                  const time = `${Math.floor(Math.random() * 60)}m ago`;

                  return (
                    <tr key={index} className="border-b border-white/5 hover:bg-surface/20 transition-colors">
                      {/* Event */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event === 'Buy' ? 'bg-green-500/20 text-green-400' :
                          event === 'Sale' ? 'bg-red-500/20 text-red-400' :
                          event === 'Launch' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event}
                        </span>
                      </td>
                      
                      {/* Token */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-surface/30 rounded-md flex items-center justify-center">
                            <span className="text-lg">{token}</span>
                          </div>
                          <div className="text-sm font-medium text-text">Token {index + 1}</div>
                        </div>
                      </td>
                      
                      {/* Price */}
                      <td className="px-6 py-4 text-left text-sm text-text">{price}</td>
                      
                      {/* Amount */}
                      <td className="px-6 py-4 text-left text-sm text-text">{amount}</td>
                      
                      {/* From */}
                      <td className="px-6 py-4 text-left text-sm text-text/70 font-mono">{from}</td>
                      
                      {/* To */}
                      <td className="px-6 py-4 text-left text-sm text-text/70 font-mono">{to}</td>
                      
                      {/* Time */}
                      <td className="px-6 py-4 text-left text-sm text-text/60">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 