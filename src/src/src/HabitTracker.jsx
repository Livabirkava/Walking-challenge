import React, { useState, useEffect } from 'react';
import { Check, X, Users, Calendar, Trophy, Plus, Trash2, Edit2, Save } from 'lucide-react';

export default function HabitTracker() {
  const [teams, setTeams] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showIndividualRanking, setShowIndividualRanking] = useState(false);
  const [showTop3, setShowTop3] = useState(false);

  // Initialize with predefined teams and members
  useEffect(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('habitTrackerData');
    if (savedData) {
      try {
        setTeams(JSON.parse(savedData));
        return;
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }

    // If no saved data, use initial data
    const initialTeams = [
      {
        id: 1,
        name: 'Squad 1',
        members: [
          'Līva Birkava',
          'Oskars Zvingulis',
          'Helvijs Leja',
          'Kerena Ansone',
          'Valērija Ecina',
          'Iveta Zālīte',
          'Jānis Ārgalis',
          'Raimonds Prieditis'
        ]
      },
      {
        id: 2,
        name: 'Squad 2',
        members: [
          'Zlata Daškeviča',
          'Inga Priedīte',
          'Aksels Trulis',
          'Rihards Liepa',
          'Vita Jekabsone',
          'Sandis Mežaraups',
          'Emils Ronis',
          'Zane Jakobsone'
        ]
      },
      {
        id: 3,
        name: 'Squad 3',
        members: [
          'Liene Dobele',
          'Krists Andersons',
          'Alise Linda Valdheima',
          'Gints Turlajs',
          'Elizabete Akona',
          'Jānis Trēgers',
          'Edvards Broders',
          'Robins Reins',
          'Markuss Brieze'
        ]
      },
      {
        id: 4,
        name: 'Squad 4',
        members: [
          'Anita',
          'Andris',
          'Viktors',
          'Jahid',
          'Aigars',
          'Erik B.',
          'Ēriks',
          'Ralfs',
          'Alla'
        ]
      },
      {
        id: 5,
        name: 'Squad 5',
        members: [
          'Janis Vedla',
          'Mikus Straumens',
          'Laila Pastare',
          'Linda Bondare',
          'Arturs Dukalskis',
          'Alberts Levics',
          'Petra Baiba Olehno',
          'Māris Punenovs'
        ]
      },
      {
        id: 6,
        name: 'Squad 6',
        members: [
          'Alic Merlivat',
          'Romans Kartasovs',
          'Martins Mozga',
          'Maris Nelsons',
          'Matvei Medvedev',
          'Adrians Piliksers',
          'Juris Lebedoks',
          'Dāvis Reinis',
          'Karlis Kalds'
        ]
      },
      {
        id: 7,
        name: 'Squad 7',
        members: [
          'Alyona Matvejeva',
          'Jānis Strapcāns',
          'Inese Tīkmane',
          'Zanda Rasa',
          'Inga Kononova',
          'Inga Basikirska',
          'Sandra Smalina',
          'Guntars Nemiro',
          'Destane Dagnija Sandberga'
        ]
      },
      {
        id: 8,
        name: 'Squad 8',
        members: [
          'Jēkabs',
          'Carloss',
          'Marta',
          'Victoria',
          'Normunds',
          'Kristīne',
          'Markuss',
          'Ivo'
        ]
      },
      {
        id: 9,
        name: 'Squad 9',
        members: [
          'Jurita Brunava',
          'Agnese Misāne',
          'Nils Ozols',
          'Aivis Brutans',
          'Deniss Vigovskis',
          'Artis Steinerts',
          'Rolands Silins'
        ]
      }
    ];

    const teamsWithMembers = initialTeams.map(team => ({
      ...team,
      members: team.members.map((name, index) => ({
        id: `${team.id}-${index}`,
        name: name,
        habits: {
          phase1: 0,
          phase2: 0,
          phase3: 0
        }
      }))
    }));

    setTeams(teamsWithMembers);
  }, []);

  // Save to localStorage whenever teams change
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('habitTrackerData', JSON.stringify(teams));
    }
  }, [teams]);

  const addMember = (teamId) => {
    setTeams(teams.map(team => {
      if (team.id === teamId && team.members.length < 9) {
        return {
          ...team,
          members: [...team.members, {
            id: Date.now(),
            name: `Dalībnieks ${team.members.length + 1}`,
            habits: {
              phase1: 0,
              phase2: 0,
              phase3: 0
            }
          }]
        };
      }
      return team;
    }));
  };

  const removeMember = (teamId, memberId) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter(m => m.id !== memberId)
        };
      }
      return team;
    }));
  };

  const updateTeamName = (teamId, newName) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, name: newName } : team
    ));
    setEditingTeam(null);
  };

  const updateMemberName = (teamId, memberId, newName) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.map(member =>
            member.id === memberId ? { ...member, name: newName } : member
          )
        };
      }
      return team;
    }));
    setEditingMember(null);
  };

  const updateMemberResult = (teamId, memberId, result) => {
    const phaseKey = `phase${currentPhase}`;
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.map(member => {
            if (member.id === memberId) {
              return {
                ...member,
                habits: {
                  ...member.habits,
                  [phaseKey]: result
                }
              };
            }
            return member;
          })
        };
      }
      return team;
    }));
  };

  const calculateStats = (team) => {
    const phaseKey = `phase${currentPhase}`;
    let totalCompleted = 0;
    let totalPossible = team.members.length * 15;
    
    team.members.forEach(member => {
      const result = parseInt(member.habits[phaseKey]) || 0;
      totalCompleted += result;
    });

    return {
      completed: totalCompleted,
      total: totalPossible,
      percentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    };
  };

  const getIndividualRanking = () => {
    const phaseKey = `phase${currentPhase}`;
    const allMembers = [];
    
    teams.forEach(team => {
      team.members.forEach(member => {
        allMembers.push({
          ...member,
          teamName: team.name,
          result: parseInt(member.habits[phaseKey]) || 0,
          percentage: Math.round(((parseInt(member.habits[phaseKey]) || 0) / 15) * 100)
        });
      });
    });
    
    return allMembers.sort((a, b) => b.result - a.result);
  };

  const getTeamRanking = () => {
    return teams
      .map(team => ({
        ...team,
        stats: calculateStats(team)
      }))
      .sort((a, b) => b.stats.percentage - a.stats.percentage);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Visual Calendar Timeline */}
        <div className="mb-8 bg-white border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Phase 1 - October */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-red-500">October</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Phase 1</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Oct 21 - Nov 7</div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div className="text-gray-400 font-medium">M</div>
                <div className="text-gray-400 font-medium">T</div>
                <div className="text-gray-400 font-medium">W</div>
                <div className="text-gray-400 font-medium">T</div>
                <div className="text-gray-400 font-medium">F</div>
                <div className="text-gray-400 font-medium">S</div>
                <div className="text-gray-400 font-medium">S</div>
                
                {/* Week 41 */}
                <div className="text-gray-300">29</div>
                <div className="text-gray-300">30</div>
                <div className="py-1">1</div>
                <div className="py-1">2</div>
                <div className="py-1">3</div>
                <div className="py-1">4</div>
                <div className="py-1">5</div>
                
                {/* Week 42 */}
                <div className="py-1">6</div>
                <div className="py-1">7</div>
                <div className="py-1">8</div>
                <div className="py-1">9</div>
                <div className="py-1">10</div>
                <div className="py-1">11</div>
                <div className="py-1">12</div>
                
                {/* Week 43 */}
                <div className="py-1">13</div>
                <div className="py-1">14</div>
                <div className="py-1">15</div>
                <div className="py-1">16</div>
                <div className="py-1">17</div>
                <div className="py-1">18</div>
                <div className="py-1">19</div>
                
                {/* Week 44 - Start of Phase 1 */}
                <div className="py-1">20</div>
                <div className="bg-red-500 text-white rounded py-1 font-medium">21</div>
                <div className="bg-blue-400 text-white py-1 rounded">22</div>
                <div className="bg-blue-400 text-white py-1 rounded">23</div>
                <div className="bg-blue-400 text-white py-1 rounded">24</div>
                <div className="bg-blue-400 text-white py-1 rounded">25</div>
                <div className="bg-blue-400 text-white py-1 rounded">26</div>
                
                {/* Week 45 */}
                <div className="bg-blue-400 text-white py-1 rounded">27</div>
                <div className="bg-blue-400 text-white py-1 rounded">28</div>
                <div className="bg-blue-400 text-white py-1 rounded">29</div>
                <div className="bg-blue-400 text-white py-1 rounded">30</div>
                <div className="bg-blue-400 text-white py-1 rounded">31</div>
                <div className="text-gray-300">1</div>
                <div className="text-gray-300">2</div>
              </div>
            </div>

            {/* Phase 2 - November */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-red-500">November</h3>
                <span className="px-2 py-1 bg-blue-200 text-blue-900 text-xs font-medium rounded">Phase 2</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Nov 10 - Nov 28</div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div className="text-gray-400 font-medium">M</div>
                <div className="text-gray-400 font-medium">T</div>
                <div className="text-gray-400 font-medium">W</div>
                <div className="text-gray-400 font-medium">T</div>
                <div className="text-gray-400 font-medium">F</div>
                <div className="text-gray-400 font-medium">S</div>
                <div className="text-gray-400 font-medium">S</div>
                
                {/* Week 44-45 continuation */}
                <div className="text-gray-300">27</div>
                <div className="text-gray-300">28</div>
                <div className="text-gray-300">29</div>
                <div className="text-gray-300">30</div>
                <div className="text-gray-300">31</div>
                <div className="bg-blue-400 text-white py-1 rounded">1</div>
                <div className="bg-blue-400 text-white py-1 rounded">2</div>
                
                {/* Week 45 - End of Phase 1 */}
                <div className="bg-blue-400 text-white py-1 rounded">3</div>
                <div className="bg-blue-400 text-white py-1 rounded">4</div>
                <div className="bg-blue-400 text-white py-1 rounded">5</div>
                <div className="bg-blue-400 text-white py-1 rounded">6</div>
                <div className="bg-blue-400 text-white py-1 rounded">7</div>
                <div className="py-1">8</div>
                <div className="py-1">9</div>
                
                {/* Week 46 - Start of Phase 2 */}
                <div className="bg-blue-600 text-white py-1 rounded">10</div>
                <div className="bg-blue-600 text-white py-1 rounded">11</div>
                <div className="bg-blue-600 text-white py-1 rounded">12</div>
                <div className="bg-blue-600 text-white py-1 rounded">13</div>
                <div className="bg-blue-600 text-white py-1 rounded">14</div>
                <div className="bg-blue-600 text-white py-1 rounded">15</div>
                <div className="bg-blue-600 text-white py-1 rounded">16</div>
                
                {/* Week 47 */}
                <div className="bg-blue-600 text-white py-1 rounded">17</div>
                <div className="bg-blue-600 text-white py-1 rounded">18</div>
                <div className="bg-blue-600 text-white py-1 rounded">19</div>
                <div className="bg-blue-600 text-white py-1 rounded">20</div>
                <div className="bg-blue-600 text-white py-1 rounded">21</div>
                <div className="bg-blue-600 text-white py-1 rounded">22</div>
                <div className="bg-blue-600 text-white py-1 rounded">23</div>
                
                {/* Week 48 - End of Phase 2 */}
                <div className="bg-blue-600 text-white py-1 rounded">24</div>
                <div className="bg-blue-600 text-white py-1 rounded">25</div>
                <div className="bg-blue-600 text-white py-1 rounded">26</div>
                <div className="bg-blue-600 text-white py-1 rounded">27</div>
                <div className="bg-blue-600 text-white py-1 rounded">28</div>
                <div className="py-1">29</div>
                <div className="py-1">30</div>
              </div>
            </div>

            {/* Phase 3 - December */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-red-500">December</h3>
                <span className="px-2 py-1 bg-indigo-200 text-indigo-900 text-xs font-medium rounded">Phase 3</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Dec 1 - Dec 19</div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <div className="text-gray-400 font-medium">M</div>
                <div className="text-gray-400 font-medium">T</div>
                <div className="text-gray-400 font-medium">W</div>
                <div className="text-gray-400 font-medium">T</div>
                <div className="text-gray-400 font-medium">F</div>
                <div className="text-gray-400 font-medium">S</div>
                <div className="text-gray-400 font-medium">S</div>
                
                {/* Week 48 - Start of Phase 3 */}
                <div className="bg-indigo-500 text-white py-1 rounded">1</div>
                <div className="bg-indigo-500 text-white py-1 rounded">2</div>
                <div className="bg-indigo-500 text-white py-1 rounded">3</div>
                <div className="bg-indigo-500 text-white py-1 rounded">4</div>
                <div className="bg-indigo-500 text-white py-1 rounded">5</div>
                <div className="bg-indigo-500 text-white py-1 rounded">6</div>
                <div className="bg-indigo-500 text-white py-1 rounded">7</div>
                
                {/* Week 49 */}
                <div className="bg-indigo-500 text-white py-1 rounded">8</div>
                <div className="bg-indigo-500 text-white py-1 rounded">9</div>
                <div className="bg-indigo-500 text-white py-1 rounded">10</div>
                <div className="bg-indigo-500 text-white py-1 rounded">11</div>
                <div className="bg-indigo-500 text-white py-1 rounded">12</div>
                <div className="bg-indigo-500 text-white py-1 rounded">13</div>
                <div className="bg-indigo-500 text-white py-1 rounded">14</div>
                
                {/* Week 50 - End of Phase 3 */}
                <div className="bg-indigo-500 text-white py-1 rounded">15</div>
                <div className="bg-indigo-500 text-white py-1 rounded">16</div>
                <div className="bg-indigo-500 text-white py-1 rounded">17</div>
                <div className="bg-indigo-500 text-white py-1 rounded">18</div>
                <div className="bg-indigo-500 text-white py-1 rounded">19</div>
                <div className="py-1">20</div>
                <div className="py-1">21</div>
                
                {/* Week 51 */}
                <div className="py-1">22</div>
                <div className="py-1">23</div>
                <div className="py-1">24</div>
                <div className="py-1">25</div>
                <div className="py-1">26</div>
                <div className="py-1">27</div>
                <div className="py-1">28</div>
                
                {/* Week 52 */}
                <div className="py-1">29</div>
                <div className="py-1">30</div>
                <div className="py-1">31</div>
                <div className="text-gray-300">1</div>
                <div className="text-gray-300">2</div>
                <div className="text-gray-300">3</div>
                <div className="text-gray-300">4</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span>Phase 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-300 rounded"></div>
              <span>Phase 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-300 rounded"></div>
              <span>Phase 3</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-light text-gray-800 tracking-wide">Habit Tracker</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{currentPhase}. posms</span>
            </div>
          </div>
          
          {/* Phase selector */}
          <div className="flex gap-2">
            {[1, 2, 3].map(phase => (
              <button
                key={phase}
                onClick={() => {
                  setCurrentPhase(phase);
                  setShowIndividualRanking(false);
                  setShowTop3(false);
                }}
                className={`px-5 py-2 text-sm font-medium transition-all ${
                  currentPhase === phase && !showIndividualRanking && !showTop3
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Phase {phase}
              </button>
            ))}
            <button
              onClick={() => {
                setShowTop3(true);
                setShowIndividualRanking(false);
              }}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                showTop3
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              TOP 3
            </button>
            <button
              onClick={() => {
                setShowIndividualRanking(true);
                setShowTop3(false);
              }}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                showIndividualRanking
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Individual Ranking
            </button>
          </div>
        </div>

        {/* TOP 3 ranking view */}
        {showTop3 && (
          <div className="space-y-6">
            {[1, 2, 3].map(phase => {
              const phaseKey = `phase${phase}`;
              const rankedTeams = teams.map(team => {
                let totalCompleted = 0;
                let totalPossible = team.members.length * 15;
                
                team.members.forEach(member => {
                  const result = parseInt(member.habits[phaseKey]) || 0;
                  totalCompleted += result;
                });

                return {
                  ...team,
                  stats: {
                    completed: totalCompleted,
                    total: totalPossible,
                    percentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
                  }
                };
              }).sort((a, b) => b.stats.percentage - a.stats.percentage).slice(0, 3);

              return (
                <div key={phase} className="bg-white border border-gray-200 p-6">
                  <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                    Top 3 - Phase {phase}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rankedTeams.map((team, index) => (
                      <div
                        key={team.id}
                        className="p-4 border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">#{index + 1}</div>
                            <div className="font-medium text-gray-900">{team.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {team.stats.completed}/{team.stats.total}
                            </div>
                          </div>
                          <div className="text-3xl font-semibold text-gray-900">
                            {team.stats.completed}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Teams overview at bottom of TOP 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {teams.map(team => {
                const stats = calculateStats(team);
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team.id);
                      setShowTop3(false);
                    }}
                    className="bg-white border border-gray-200 hover:border-gray-400 p-4 text-left transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {team.name}
                      </h3>
                      <span className="text-xs text-gray-500">{team.members.length}/9</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 h-1">
                        <div
                          className="bg-blue-600 h-1 transition-all"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3ch]">
                        {stats.completed}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Teams overview for regular views */}
        {!showTop3 && !showIndividualRanking && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {teams.map(team => {
              const stats = calculateStats(team);
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`bg-white border p-4 text-left transition-all ${
                    selectedTeam === team.id 
                      ? 'border-gray-900' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {editingTeam === team.id ? (
                      <input
                        type="text"
                        defaultValue={team.name}
                        onBlur={(e) => updateTeamName(team.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateTeamName(team.id, e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="font-medium text-gray-900 border-b border-gray-900 outline-none"
                      />
                    ) : (
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        {team.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTeam(team.id);
                          }}
                          className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </h3>
                    )}
                    <span className="text-xs text-gray-500">{team.members.length}/9</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 h-1">
                      <div
                        className="bg-blue-600 h-1 transition-all"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[3ch]">
                      {stats.completed}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected team detail */}
        {selectedTeam && !showIndividualRanking && !showTop3 && (
          <div className="bg-white border border-gray-200 p-6">
            {(() => {
              const team = teams.find(t => t.id === selectedTeam);
              const phaseKey = `phase${currentPhase}`;
              
              return (
                <>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">{team.name}</h2>

                  {team.members.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <div className="w-12 h-12 mx-auto mb-3 border border-gray-300 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm">Nav dalībnieku</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                              Participant
                            </th>
                            <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                              Phase {currentPhase}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.members.map(member => {
                            const result = parseInt(member.habits[phaseKey]) || 0;
                            const percentage = Math.round((result / 15) * 100);
                            
                            return (
                              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  {editingMember === member.id ? (
                                    <input
                                      type="text"
                                      defaultValue={member.name}
                                      onBlur={(e) => updateMemberName(team.id, member.id, e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          updateMemberName(team.id, member.id, e.target.value);
                                        }
                                      }}
                                      autoFocus
                                      className="text-sm text-gray-900 border-b border-gray-900 outline-none w-full"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 group">
                                      <span className="text-sm text-gray-900">{member.name}</span>
                                      <button
                                        onClick={() => setEditingMember(member.id)}
                                        className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="number"
                                      min="0"
                                      max="15"
                                      value={result}
                                      onChange={(e) => {
                                        const value = Math.min(15, Math.max(0, parseInt(e.target.value) || 0));
                                        updateMemberResult(team.id, member.id, value);
                                      }}
                                      className="w-16 text-center text-sm text-gray-900 bg-transparent border-0 outline-none focus:outline-none"
                                    />
                                    {/* Progress bar */}
                                    <div className="flex-1 bg-gray-100 h-1">
                                      <div
                                        className="bg-blue-600 h-1 transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600 min-w-[4ch]">
                                      / 15
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* All teams view - showing all squads with their members */}
        {!selectedTeam && !showIndividualRanking && !showTop3 && (
          <div className="space-y-6">
            {teams.map(team => {
              const phaseKey = `phase${currentPhase}`;
              return (
                <div key={team.id} className="bg-white border border-gray-200">
                  {/* Squad header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-medium text-gray-900">
                      {team.name}
                    </h3>
                  </div>
                  
                  {/* Members list */}
                  <div className="p-6">
                    {team.members.length === 0 ? (
                      <p className="text-sm text-gray-400">Nav dalībnieku</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                                Participant
                              </th>
                              <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                                Phase {currentPhase}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.members.map(member => {
                              const result = parseInt(member.habits[phaseKey]) || 0;
                              const percentage = Math.round((result / 15) * 100);
                              
                              return (
                                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <span className="text-sm text-gray-900">{member.name}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="number"
                                        min="0"
                                        max="15"
                                        value={result}
                                        onChange={(e) => {
                                          const value = Math.min(15, Math.max(0, parseInt(e.target.value) || 0));
                                          updateMemberResult(team.id, member.id, value);
                                        }}
                                        className="w-16 text-center text-sm text-gray-900 bg-transparent border-0 outline-none focus:outline-none"
                                      />
                                      {/* Progress bar */}
                                      <div className="flex-1 bg-gray-100 h-1">
                                        <div
                                          className="bg-blue-600 h-1 transition-all"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <span className="text-sm text-gray-600 min-w-[4ch]">
                                        / 15
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

                      <tbody>
                  {(() => {
                    const allMembers = [];

                    teams.forEach(team => {
                      team.members.forEach(member => {
                        const phase1 = parseInt(member.habits.phase1) || 0;
                        const phase2 = parseInt(member.habits.phase2) || 0;
                        const phase3 = parseInt(member.habits.phase3) || 0;
                        const total = phase1 + phase2 + phase3;

                        allMembers.push({
                          ...member,
                          teamName: team.name,
                          phase1,
                          phase2,
                          phase3,
                          total,
                        });
                      });
                    });

                    return allMembers
                      .sort((a, b) => b.total - a.total)
                      .map((member, index) => {
                        const squadShort =
                          member.teamName &&
                          member.teamName.startsWith('Squad ')
                            ? 'S' + member.teamName.replace('Squad ', '')
                            : member.teamName || '';

                        return (
                          <tr
                            key={member.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            {/* place */}
                            <td className="py-3 px-4">
                              <span
                                className={`text-sm font-medium ${
                                  index === 0
                                    ? 'text-yellow-600'
                                    : index === 1
                                    ? 'text-gray-500'
                                    : index === 2
                                    ? 'text-orange-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                #{index + 1}
                              </span>
                            </td>

                            {/* name */}
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">
                                {member.name}
                              </span>
                            </td>

                            {/* Squad */}
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-500">
                                {squadShort}
                              </span>
                            </td>

                            {/* phases + total */}
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-900">
                                {member.phase1}/15
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-900">
                                {member.phase2}/15
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-900">
                                {member.phase3}/15
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center bg-gray-50">
                              <span className="text-sm font-semibold text-gray-900">
                                {member.total}/45
                              </span>
                            </td>
                          </tr>
                        );
                      });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
