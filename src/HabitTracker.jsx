import React, { useState, useEffect } from 'react';
import { Calendar, Users, Edit2, X } from 'lucide-react';

const ADMIN_PASSWORD = 'walkingadmin';

// Show "First Last" as "First L."
function shortName(fullName) {
  const trimmed = fullName.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;
  const first = parts[0];
  const last = parts[parts.length - 1];
  const initial = last[0] || '';
  return `${first} ${initial}.`;
}

// Initial squads + members
function createInitialTeams() {
  const rawTeams = [
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

  return rawTeams.map(team => ({
    ...team,
    members: team.members.map((name, index) => ({
      id: `${team.id}-${index}`,
      name,
      habits: { phase1: 0, phase2: 0, phase3: 0 }
    }))
  }));
}

export default function HabitTracker() {
  const [teams, setTeams] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showIndividualRanking, setShowIndividualRanking] = useState(false);
  const [showTop3, setShowTop3] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');

  // Load from localStorage or use initial data
  useEffect(() => {
    const saved = localStorage.getItem('habitTrackerData');
    if (saved) {
      try {
        setTeams(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
    setTeams(createInitialTeams());
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (teams.length) {
      localStorage.setItem('habitTrackerData', JSON.stringify(teams));
    }
  }, [teams]);

  // ---------- Admin handlers ----------
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminCode === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminError('');
      setAdminCode('');
      setShowAdminModal(false);
    } else {
      setIsAdmin(false);
      setAdminError('Wrong password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminCode('');
    setAdminError('');
  };

  // ---------- Update helpers ----------
  const updateTeamName = (teamId, newName) => {
    if (!isAdmin) return;
    setTeams(teams.map(team =>
      team.id === teamId ? { ...team, name: newName } : team
    ));
    setEditingTeam(null);
  };

  const updateMemberName = (teamId, memberId, newName) => {
    if (!isAdmin) return;
    setTeams(teams.map(team => {
      if (team.id !== teamId) return team;
      return {
        ...team,
        members: team.members.map(m =>
          m.id === memberId ? { ...m, name: newName } : m
        )
      };
    }));
    setEditingMember(null);
  };

  const updateMemberResult = (teamId, memberId, result) => {
    if (!isAdmin) return;
    const phaseKey = `phase${currentPhase}`;
    setTeams(teams.map(team => {
      if (team.id !== teamId) return team;
      return {
        ...team,
        members: team.members.map(m =>
          m.id === memberId
            ? {
                ...m,
                habits: { ...m.habits, [phaseKey]: result }
              }
            : m
        )
      };
    }));
  };

  const calculateStats = (team) => {
    const phaseKey = `phase${currentPhase}`;
    const totalPossible = team.members.length * 15;
    const completed = team.members.reduce(
      (sum, m) => sum + (parseInt(m.habits[phaseKey]) || 0),
      0
    );
    return {
      completed,
      total: totalPossible,
      percentage: totalPossible ? Math.round((completed / totalPossible) * 100) : 0
    };
  };

  const progressBarClass = 'bg-sky-500 h-1 transition-all';

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Calendar timeline */}
        <div className="mb-8 bg-white border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Phase 1 – October */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-red-500">October</h3>
                <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded">
                  Phase 1
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Oct 21 – Nov 7</div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Weekday labels */}
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                  <div key={d} className="text-gray-400 font-medium">
                    {d}
                  </div>
                ))}

                {/* Weeks */}
                {/* 29 30 1 2 3 4 5 */}
                <div className="text-gray-300">29</div>
                <div className="text-gray-300">30</div>
                <div className="py-1">1</div>
                <div className="py-1">2</div>
                <div className="py-1">3</div>
                <div className="py-1">4</div>
                <div className="py-1">5</div>

                {/* 6–12 */}
                {[6, 7, 8, 9, 10, 11, 12].map(d => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}

                {/* 13–19 */}
                {[13, 14, 15, 16, 17, 18, 19].map(d => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}

                {/* 20–26 (Phase start 21–24, weekdays only) */}
                <div className="py-1">20</div>
                <div className="bg-rose-300 text-white rounded py-1 font-medium">21</div>
                <div className="bg-sky-300 text-white rounded py-1">22</div>
                <div className="bg-sky-300 text-white rounded py-1">23</div>
                <div className="bg-sky-300 text-white rounded py-1">24</div>
                <div className="py-1">25</div>
                <div className="py-1">26</div>

                {/* 27–31 + Nov 1–2 */}
                <div className="bg-sky-300 text-white rounded py-1">27</div>
                <div className="bg-sky-300 text-white rounded py-1">28</div>
                <div className="bg-sky-300 text-white rounded py-1">29</div>
                <div className="bg-sky-300 text-white rounded py-1">30</div>
                <div className="bg-sky-300 text-white rounded py-1">31</div>
                <div className="text-gray-300">1</div>
                <div className="text-gray-300">2</div>
              </div>
            </div>

            {/* Phase 2 – November */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-red-500">November</h3>
                <span className="px-2 py-1 bg-sky-200 text-sky-900 text-xs font-medium rounded">
                  Phase 2
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Nov 10 – Nov 28</div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                  <div key={d} className="text-gray-400 font-medium">
                    {d}
                  </div>
                ))}

                {/* 27–31 Oct + 1–2 Nov (context only) */}
                <div className="text-gray-300">27</div>
                <div className="text-gray-300">28</div>
                <div className="text-gray-300">29</div>
                <div className="text-gray-300">30</div>
                <div className="text-gray-300">31</div>
                <div className="py-1">1</div>
                <div className="py-1">2</div>

                {/* 3–9 */}
                {[3, 4, 5, 6, 7].map(d => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
                <div className="py-1">8</div>
                <div className="py-1">9</div>

                {/* 10–16 (phase weekdays colored) */}
                <div className="bg-sky-400 text-white rounded py-1">10</div>
                <div className="bg-sky-400 text-white rounded py-1">11</div>
                <div className="bg-sky-400 text-white rounded py-1">12</div>
                <div className="bg-sky-400 text-white rounded py-1">13</div>
                <div className="bg-sky-400 text-white rounded py-1">14</div>
                <div className="py-1">15</div>
                <div className="py-1">16</div>

                {/* 17–23 */}
                <div className="bg-sky-400 text-white rounded py-1">17</div>
                <div className="bg-sky-400 text-white rounded py-1">18</div>
                <div className="bg-sky-400 text-white rounded py-1">19</div>
                <div className="bg-sky-400 text-white rounded py-1">20</div>
                <div className="bg-sky-400 text-white rounded py-1">21</div>
                <div className="py-1">22</div>
                <div className="py-1">23</div>

                {/* 24–30 (phase end 24–28 weekdays) */}
                <div className="bg-sky-400 text-white rounded py-1">24</div>
                <div className="bg-sky-400 text-white rounded py-1">25</div>
                <div className="bg-sky-400 text-white rounded py-1">26</div>
                <div className="bg-sky-400 text-white rounded py-1">27</div>
                <div className="bg-sky-400 text-white rounded py-1">28</div>
                <div className="py-1">29</div>
                <div className="py-1">30</div>
              </div>
            </div>

            {/* Phase 3 – December */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-medium text-red-500">December</h3>
                <span className="px-2 py-1 bg-indigo-200 text-indigo-900 text-xs font-medium rounded">
                  Phase 3
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Dec 1 – Dec 19</div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                  <div key={d} className="text-gray-400 font-medium">
                    {d}
                  </div>
                ))}

                {/* 1–7 */}
                <div className="bg-indigo-400 text-white rounded py-1">1</div>
                <div className="bg-indigo-400 text-white rounded py-1">2</div>
                <div className="bg-indigo-400 text-white rounded py-1">3</div>
                <div className="bg-indigo-400 text-white rounded py-1">4</div>
                <div className="bg-indigo-400 text-white rounded py-1">5</div>
                <div className="py-1">6</div>
                <div className="py-1">7</div>

                {/* 8–14 */}
                <div className="bg-indigo-400 text-white rounded py-1">8</div>
                <div className="bg-indigo-400 text-white rounded py-1">9</div>
                <div className="bg-indigo-400 text-white rounded py-1">10</div>
                <div className="bg-indigo-400 text-white rounded py-1">11</div>
                <div className="bg-indigo-400 text-white rounded py-1">12</div>
                <div className="py-1">13</div>
                <div className="py-1">14</div>

                {/* 15–21 (phase end at 19) */}
                <div className="bg-indigo-400 text-white rounded py-1">15</div>
                <div className="bg-indigo-400 text-white rounded py-1">16</div>
                <div className="bg-indigo-400 text-white rounded py-1">17</div>
                <div className="bg-indigo-400 text-white rounded py-1">18</div>
                <div className="bg-indigo-400 text-white rounded py-1">19</div>
                <div className="py-1">20</div>
                <div className="py-1">21</div>

                {/* 22–28 */}
                {[22, 23, 24, 25, 26, 27, 28].map(d => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}

                {/* 29–31 + jan context */}
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

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-300 rounded" />
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-sky-200 rounded" />
              <span>Phase 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-sky-400 rounded" />
              <span>Phase 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-400 rounded" />
              <span>Phase 3</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-light text-gray-800 tracking-wide">
              Habit Tracker
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{currentPhase}. posms</span>
              </div>

              <span className="hidden sm:block h-4 w-px bg-slate-200" />

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-medium">
                    Admin mode
                  </span>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="text-xs text-slate-500 hover:text-slate-900 underline"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(true);
                    setAdminError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          {/* Phase / ranking buttons */}
          <div className="flex flex-wrap gap-2">
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
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Phase {phase}
              </button>
            ))}
            <button
              onClick={() => {
                setShowTop3(true);
                setShowIndividualRanking(false);
                setSelectedTeam(null);
              }}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                showTop3
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              TOP 3
            </button>
            <button
              onClick={() => {
                setShowIndividualRanking(true);
                setShowTop3(false);
                setSelectedTeam(null);
              }}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                showIndividualRanking
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Individual Ranking
            </button>
          </div>
        </div>

        {/* TOP 3 teams view */}
        {showTop3 && (
          <div className="space-y-6">
            {[1, 2, 3].map(phase => {
              const phaseKey = `phase${phase}`;
              const rankedTeams = teams
                .map(team => {
                  const totalPossible = team.members.length * 15;
                  const completed = team.members.reduce(
                    (sum, m) => sum + (parseInt(m.habits[phaseKey]) || 0),
                    0
                  );
                  return {
                    ...team,
                    stats: {
                      completed,
                      total: totalPossible,
                      percentage: totalPossible
                        ? Math.round((completed / totalPossible) * 100)
                        : 0
                    }
                  };
                })
                .sort((a, b) => b.stats.percentage - a.stats.percentage)
                .slice(0, 3);

              return (
                <div key={phase} className="bg-white border border-slate-200 p-6">
                  <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                    Top 3 – Phase {phase}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rankedTeams.map((team, index) => (
                      <div
                        key={team.id}
                        className="p-4 border border-slate-200 bg-slate-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">
                              #{index + 1}
                            </div>
                            <div className="font-medium text-gray-900">
                              {team.name}
                            </div>
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

            {/* Quick overview cards */}
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
                    className="bg-white border border-slate-200 hover:border-slate-400 p-4 text-left transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      <span className="text-xs text-gray-500">
                        {team.members.length}/9
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-1">
                        <div
                          className={progressBarClass}
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

        {/* Squad cards (phase view) */}
        {!showTop3 && !showIndividualRanking && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {teams.map(team => {
              const stats = calculateStats(team);
              const canEdit = isAdmin;

              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`bg-white border p-4 text-left transition-all ${
                    selectedTeam === team.id
                      ? 'border-slate-900'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    {canEdit && editingTeam === team.id ? (
                      <input
                        type="text"
                        defaultValue={team.name}
                        onBlur={(e) => updateTeamName(team.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateTeamName(team.id, e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="font-medium text-gray-900 border-b border-slate-900 outline-none bg-transparent"
                      />
                    ) : (
                      <h3 className="font-medium text-gray-900 flex items-center gap-2 group">
                        {team.name}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTeam(team.id);
                            }}
                            className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </h3>
                    )}
                    <span className="text-xs text-gray-500">
                      {team.members.length}/9
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-1">
                      <div
                        className={progressBarClass}
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

        {/* Selected squad detail */}
        {selectedTeam && !showIndividualRanking && !showTop3 && (
          <div className="bg-white border border-slate-200 p-6">
            {(() => {
              const team = teams.find(t => t.id === selectedTeam);
              if (!team) return null;
              const phaseKey = `phase${currentPhase}`;
              const canEdit = isAdmin;

              return (
                <>
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    {team.name}
                  </h2>

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
                          <tr className="border-b border-slate-200">
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
                              <tr
                                key={member.id}
                                className="border-b border-slate-100 hover:bg-slate-50"
                              >
                                <td className="py-3 px-4">
                                  {canEdit && editingMember === member.id ? (
                                    <input
                                      type="text"
                                      defaultValue={member.name}
                                      onBlur={(e) =>
                                        updateMemberName(team.id, member.id, e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          updateMemberName(team.id, member.id, e.target.value);
                                        }
                                      }}
                                      autoFocus
                                      className="text-sm text-gray-900 border-b border-slate-900 outline-none w-full bg-transparent"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 group">
                                      <span className="text-sm text-gray-900">
                                        {shortName(member.name)}
                                      </span>
                                      {canEdit && (
                                        <button
                                          type="button"
                                          onClick={() => setEditingMember(member.id)}
                                          className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      )}
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
                                        const value = Math.min(
                                          15,
                                          Math.max(0, parseInt(e.target.value) || 0)
                                        );
                                        updateMemberResult(team.id, member.id, value);
                                      }}
                                      disabled={!canEdit}
                                      readOnly={!canEdit}
                                      className={`w-16 text-center text-sm bg-transparent border-0 outline-none ${
                                        canEdit
                                          ? 'text-gray-900'
                                          : 'text-gray-400 cursor-not-allowed'
                                      }`}
                                    />
                                    <div className="flex-1 bg-slate-100 h-1">
                                      <div
                                        className={progressBarClass}
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

        {/* All squads full list */}
        {!selectedTeam && !showIndividualRanking && !showTop3 && (
          <div className="space-y-6">
            {teams.map(team => {
              const phaseKey = `phase${currentPhase}`;
              const canEdit = isAdmin;

              return (
                <div key={team.id} className="bg-white border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-base font-medium text-gray-900">
                      {team.name}
                    </h3>
                  </div>
                  <div className="p-6">
                    {team.members.length === 0 ? (
                      <p className="text-sm text-gray-400">Nav dalībnieku</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
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
                                <tr
                                  key={member.id}
                                  className="border-b border-slate-100 hover:bg-slate-50"
                                >
                                  <td className="py-3 px-4">
                                    <span className="text-sm text-gray-900">
                                      {shortName(member.name)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="number"
                                        min="0"
                                        max="15"
                                        value={result}
                                        onChange={(e) => {
                                          const value = Math.min(
                                            15,
                                            Math.max(0, parseInt(e.target.value) || 0)
                                          );
                                          updateMemberResult(team.id, member.id, value);
                                        }}
                                        disabled={!canEdit}
                                        readOnly={!canEdit}
                                        className={`w-16 text-center text-sm bg-transparent border-0 outline-none ${
                                          canEdit
                                            ? 'text-gray-900'
                                            : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                      />
                                      <div className="flex-1 bg-slate-100 h-1">
                                        <div
                                          className={progressBarClass}
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

        {/* Individual ranking */}
        {showIndividualRanking && (
          <div className="bg-white border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Individual Ranking – All Phases
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium w-16">
                      Place
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Participant
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Phase 1
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Phase 2
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Phase 3
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-gray-900 font-semibold bg-slate-50">
                      Total
                    </th>
                  </tr>
                </thead>
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
                          total
                        });
                      });
                    });

                    return allMembers
                      .sort((a, b) => b.total - a.total)
                      .map((member, index) => (
                        <tr
                          key={member.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
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
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">
                              {shortName(member.name)}
                            </span>
                          </td>
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
                          <td className="py-3 px-4 text-center bg-slate-50">
                            <span className="text-sm font-semibold text-gray-900">
                              {member.total}/45
                            </span>
                          </td>
                        </tr>
                      ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin modal */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Admin access
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Enter admin code
                  </label>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
                    autoFocus
                  />
                  {adminError && (
                    <p className="text-xs text-red-500">{adminError}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
