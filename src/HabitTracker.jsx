import React, { useState, useEffect } from 'react';
import { Calendar, Users, X } from 'lucide-react';

// ----- CONSTANTS -------------------------------------------------------------

// 👇 ŠEIT IELIEC SAVU PILNO /exec URL (bez "...")
const SHEET_API_URL =
  'https://script.google.com/macros/s/AKfycbysVXadEnycsjH6WWwBwrGSVKiskfbslvi4Kc-TWjTWeH93aktcI0TkYG6Zswx-5Jdu/exec';

const ADMIN_CODE = 'walkingadmin';

// Raw team data (names only) – fallback, ja API nestrādā
const INITIAL_TEAMS = [
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
      'Raimonds Prieditis',
    ],
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
      'Zane Jakobsone',
    ],
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
      'Markuss Brieze',
    ],
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
      'Alla',
    ],
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
      'Māris Punenovs',
    ],
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
      'Karlis Kalds',
    ],
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
      'Destane Dagnija Sandberga',
    ],
  },
  {
    id: 8,
    name: 'Squad 8',
    members: ['Jēkabs', 'Carloss', 'Marta', 'Victoria', 'Normunds', 'Kristīne', 'Markuss', 'Ivo'],
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
      'Rolands Silins',
    ],
  },
];

// ----- HELPERS --------------------------------------------------------------

// "Līva Birkava" -> "Līva B."
const shortenName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;
  const [first, ...rest] = parts;
  const lastInitial = rest[rest.length - 1]?.[0] ?? '';
  return `${first} ${lastInitial}.`;
};

const buildInitialTeams = () =>
  INITIAL_TEAMS.map((team) => ({
    ...team,
    members: team.members.map((name, index) => ({
      id: `${team.id}-${index}`,
      name,
      habits: { phase1: 0, phase2: 0, phase3: 0 },
    })),
  }));

const calculateStats = (team, phaseKey) => {
  const totalPossible = team.members.length * 15;
  const completed = team.members.reduce(
    (sum, m) => sum + (parseInt(m.habits[phaseKey], 10) || 0),
    0
  );
  return {
    completed,
    total: totalPossible,
    percentage: totalPossible ? Math.round((completed / totalPossible) * 100) : 0,
  };
};

// Reusable member table
const MemberTable = ({ team, phaseKey, isAdmin, onChange }) => {
  if (!team || !team.members.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-12 h-12 mx-auto mb-3 border border-slate-300 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-sm">Nav dalībnieku</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
              Participant
            </th>
            <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
              Phase
            </th>
          </tr>
        </thead>
        <tbody>
          {team.members.map((member) => {
            const result = parseInt(member.habits[phaseKey], 10) || 0;
            const percentage = Math.round((result / 15) * 100);

            return (
              <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <span className="text-slate-900">{shortenName(member.name)}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={result}
                      disabled={!isAdmin}
                      onChange={(e) =>
                        onChange(team.id, member.id, parseInt(e.target.value, 10))
                      }
                      className={`w-16 text-center bg-transparent outline-none border-0 text-slate-900 text-sm ${
                        isAdmin ? 'focus:ring-0' : 'cursor-not-allowed text-slate-400'
                      }`}
                    />
                    <div className="flex-1 h-1 bg-slate-100">
                      <div
                        className="h-1 bg-sky-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-600 text-sm min-w-[4ch]">/ 15</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Helper for colored calendar days
const phaseDayClass = (variant) => {
  switch (variant) {
    case 'start':
      return 'py-1 rounded bg-rose-200 text-rose-900 font-medium';
    case 'p1':
      return 'py-1 rounded bg-sky-200 text-sky-900 font-medium';
    case 'p2':
      return 'py-1 rounded bg-sky-400 text-white font-medium';
    case 'p3':
      return 'py-1 rounded bg-indigo-400 text-white font-medium';
    case 'muted':
      return 'text-slate-300';
    default:
      return 'py-1';
  }
};

const WeekdayHeaderRow = () => (
  <>
    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
      <div key={d} className="text-slate-400 font-medium text-center text-xs">
        {d}
      </div>
    ))}
  </>
);

// Transformē Google Sheets rindas uz teams struktūru
// Piezīme: PĀRLIECINIES, ka šeit lietotie key nosaukumi atbilst pirmajai rindai tavā sheet:
// piem. "Squad", "Name", "1", "2", "3" u.c.
const transformSheetRows = (rows) => {
  const groups = {};

  rows.forEach((row, index) => {
    const squad =
      row.Squad || row.squad || row.squad_name || row['Squad name'] || row['squad_id'];
    const name = row.Name || row.name || row.member_name;

    if (!squad || !name) return;

    if (!groups[squad]) groups[squad] = [];

    groups[squad].push({
      id: `${squad}-${index}`,
      name,
      habits: {
        phase1: parseInt(row['1'], 10) || parseInt(row.phase1, 10) || 0,
        phase2: parseInt(row['2'], 10) || parseInt(row.phase2, 10) || 0,
        phase3: parseInt(row['3'], 10) || parseInt(row.phase3, 10) || 0,
      },
    });
  });

  return Object.keys(groups).map((key, index) => ({
    id: index + 1,
    name: key,
    members: groups[key],
  }));
};

// ----- MAIN COMPONENT --------------------------------------------------------

export default function HabitTracker() {
  const [teams, setTeams] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showIndividualRanking, setShowIndividualRanking] = useState(false);
  const [showTop3, setShowTop3] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

  const phaseKey = `phase${currentPhase}`;

  // --- Data init: mēģina ielasīt no Google Sheets, ja neizdodas -> fallback uz INITIAL_TEAMS ---
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(SHEET_API_URL);
        if (!res.ok) {
          throw new Error('Bad response from sheet API');
        }

        const data = await res.json(); // { rows: [...] }
        const rows = data.rows || [];

        if (!rows.length) {
          console.warn('No rows from sheet, using INITIAL_TEAMS');
          setTeams(buildInitialTeams());
          return;
        }

        const mappedTeams = transformSheetRows(rows);
        setTeams(mappedTeams);
      } catch (err) {
        console.error('Failed to load sheet data, using INITIAL_TEAMS instead:', err);
        setTeams(buildInitialTeams());
      }
    }

    loadData();
  }, []);

  // --- Admin handling ---
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminInput.trim() === ADMIN_CODE) {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminInput('');
    } else {
      alert('Wrong admin code');
    }
  };

  // --- Helpers for stats & rankings ---

  const updateMemberResult = (teamId, memberId, value) => {
    if (!isAdmin) return;
    const safe = Math.min(15, Math.max(0, value || 0));

    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? {
              ...team,
              members: team.members.map((m) =>
                m.id === memberId
                  ? {
                      ...m,
                      habits: {
                        ...m.habits,
                        [phaseKey]: safe,
                      },
                    }
                  : m
              ),
            }
          : team
      )
    );
  };

  const getIndividualRankingData = () => {
    const all = [];
    teams.forEach((team) => {
      team.members.forEach((member) => {
        const p1 = parseInt(member.habits.phase1, 10) || 0;
        const p2 = parseInt(member.habits.phase2, 10) || 0;
        const p3 = parseInt(member.habits.phase3, 10) || 0;
        all.push({
          ...member,
          teamName: team.name,
          phase1: p1,
          phase2: p2,
          phase3: p3,
          total: p1 + p2 + p3,
        });
      });
    });
    return all.sort((a, b) => b.total - a.total);
  };

  const getTop3ByPhase = (phase) => {
    const key = `phase${phase}`;
    return teams
      .map((team) => ({
        ...team,
        stats: calculateStats(team, key),
      }))
      .sort((a, b) => b.stats.percentage - a.stats.percentage)
      .slice(0, 3);
  };

  // --- UI --------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* CALENDAR */}
        <div className="bg-white border border-slate-200 p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* October / Phase 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-rose-500">October</h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-sky-100 text-sky-900">
                  Phase 1
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">Oct 21 – Nov 7</div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <WeekdayHeaderRow />

                {/* 29–31 previous month + 1–5 */}
                <div className={phaseDayClass('muted')}>29</div>
                <div className={phaseDayClass('muted')}>30</div>
                <div className={phaseDayClass()}>{1}</div>
                <div className={phaseDayClass()}>{2}</div>
                <div className={phaseDayClass()}>{3}</div>
                <div className={phaseDayClass()}>{4}</div>
                <div className={phaseDayClass()}>{5}</div>

                {/* 6–12 */}
                {[6, 7, 8, 9, 10, 11, 12].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}

                {/* 13–19 */}
                {[13, 14, 15, 16, 17, 18, 19].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}

                {/* Start + Phase 1 dates: 21,22,23,24,28,29,30,31 */}
                <div className={phaseDayClass()}>{20}</div>
                <div className={phaseDayClass('start')}>21</div>
                <div className={phaseDayClass('p1')}>22</div>
                <div className={phaseDayClass('p1')}>23</div>
                <div className={phaseDayClass('p1')}>24</div>
                {/* 25, 26, 27 plain */}
                {[25, 26, 27].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
                {/* 28–31 Phase1 */}
                {[28, 29, 30, 31].map((d) => (
                  <div key={d} className={phaseDayClass('p1')}>
                    {d}
                  </div>
                ))}
                <div className={phaseDayClass('muted')}>1</div>
                <div className={phaseDayClass('muted')}>2</div>
              </div>
            </div>

            {/* November / Phase 2 (Phase 1 tail 4–7) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-rose-500">November</h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-sky-200 text-sky-900">
                  Phase 2
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">Nov 10 – Nov 28</div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <WeekdayHeaderRow />

                {/* Tail from October */}
                {[27, 28, 29, 30, 31].map((d) => (
                  <div key={d} className={phaseDayClass('muted')}>
                    {d}
                  </div>
                ))}
                {/* 1–3 plain */}
                {[1, 2, 3].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
                {/* Phase1 in November: 4–7 */}
                {[4, 5, 6, 7].map((d) => (
                  <div key={d} className={phaseDayClass('p1')}>
                    {d}
                  </div>
                ))}
                {/* 8–9 plain */}
                {[8, 9].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}

                {/* Phase 2: weekdays only 11–14, 18–21, 25–28 */}
                <div className={phaseDayClass()}>{10}</div>
                {[11, 12, 13, 14].map((d) => (
                  <div key={d} className={phaseDayClass('p2')}>
                    {d}
                  </div>
                ))}
                {[15, 16, 17].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
                {[18, 19, 20, 21].map((d) => (
                  <div key={d} className={phaseDayClass('p2')}>
                    {d}
                  </div>
                ))}
                {[22, 23, 24].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
                {[25, 26, 27, 28].map((d) => (
                  <div key={d} className={phaseDayClass('p2')}>
                    {d}
                  </div>
                ))}
                {[29, 30].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* December / Phase 3 – weekdays only, exact dates list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-rose-500">December</h3>
                <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-200 text-indigo-900">
                  Phase 3
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">Dec 1 – Dec 19</div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                <WeekdayHeaderRow />

                {/* 1 plain */}
                <div className={phaseDayClass()}>1</div>

                {/* Phase3: 2–5 */}
                {[2, 3, 4, 5].map((d) => (
                  <div key={d} className={phaseDayClass('p3')}>
                    {d}
                  </div>
                ))}
                {/* 6–8 plain */}
                {[6, 7, 8].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
                {/* Phase3: 9–12 */}
                {[9, 10, 11, 12].map((d) => (
                  <div key={d} className={phaseDayClass('p3')}>
                    {d}
                  </div>
                ))}
                {/* 13–15 plain */}
                {[13, 14, 15].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
                {/* Phase3: 16–19 */}
                {[16, 17, 18, 19].map((d) => (
                  <div key={d} className={phaseDayClass('p3')}>
                    {d}
                  </div>
                ))}
                {/* 20–31 plain */}
                {[20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d) => (
                  <div key={d} className={phaseDayClass()}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-200" />
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-sky-200" />
              <span>Phase 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-sky-400" />
              <span>Phase 2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-indigo-400" />
              <span>Phase 3</span>
            </div>
          </div>
        </div>

        {/* HEADER + CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{currentPhase}. posms</span>
            </div>

            <div className="flex flex-wrap gap-2 items-center mt-2 md:mt-0">
              {[1, 2, 3].map((phase) => {
                const isActive = currentPhase === phase && !showTop3 && !showIndividualRanking;
                return (
                  <button
                    key={phase}
                    onClick={() => {
                      setCurrentPhase(phase);
                      setShowTop3(false);
                      setShowIndividualRanking(false);
                      setSelectedTeam(null);
                    }}
                    className={`px-4 py-2 text-sm font-medium border transition ${
                      isActive
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Phase {phase}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setShowTop3(true);
                  setShowIndividualRanking(false);
                  setSelectedTeam(null);
                }}
                className={`px-4 py-2 text-sm font-medium border transition ${
                  showTop3
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                className={`px-4 py-2 text-sm font-medium border transition ${
                  showIndividualRanking
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Individual Ranking
              </button>
            </div>
          </div>

          {/* Admin button on the right */}
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="self-start md:self-auto px-3 py-2 text-xs font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          >
            Admin
          </button>
        </div>

        {/* TOP 3 VIEW */}
        {showTop3 && (
          <div className="space-y-6">
            {[1, 2, 3].map((phase) => {
              const ranked = getTop3ByPhase(phase);
              return (
                <div key={phase} className="bg-white border border-slate-200 p-6">
                  <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-4">
                    Top 3 – Phase {phase}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {ranked.map((team, index) => (
                      <div key={team.id} className="p-4 border border-slate-200 bg-slate-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">#{index + 1}</div>
                            <div className="font-medium text-slate-900">{team.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {team.stats.completed}/{team.stats.total}
                            </div>
                          </div>
                          <div className="text-3xl font-semibold text-slate-900">
                            {team.stats.completed}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TEAMS OVERVIEW (buttons) when not top3 / individual */}
        {!showTop3 && !showIndividualRanking && (
          <div className="grid md:grid-cols-3 gap-3">
            {teams.map((team) => {
              const stats = calculateStats(team, phaseKey);
              const isSelected = selectedTeam === team.id;

              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(isSelected ? null : team.id)}
                  className={`bg-white border p-4 text-left transition ${
                    isSelected ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900">{team.name}</h3>
                    <span className="text-xs text-slate-500">{team.members.length}/9</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-slate-100">
                      <div
                        className="h-1 bg-sky-500 transition-all"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 min-w-[3ch]">
                      {stats.completed}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* SELECTED TEAM DETAIL */}
        {selectedTeam && !showTop3 && !showIndividualRanking && (
          <div className="bg-white border border-slate-200 p-6">
            {(() => {
              const team = teams.find((t) => t.id === selectedTeam);
              if (!team) return null;
              return (
                <>
                  <h2 className="text-lg font-medium text-slate-900 mb-6">{team.name}</h2>
                  <MemberTable
                    team={team}
                    phaseKey={phaseKey}
                    isAdmin={isAdmin}
                    onChange={updateMemberResult}
                  />
                </>
              );
            })()}
          </div>
        )}

        {/* ALL TEAMS TABLE VIEW (no team selected, no rankings) */}
        {!selectedTeam && !showTop3 && !showIndividualRanking && (
          <div className="space-y-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-medium text-slate-900">{team.name}</h3>
                </div>
                <div className="p-6">
                  <MemberTable
                    team={team}
                    phaseKey={phaseKey}
                    isAdmin={isAdmin}
                    onChange={updateMemberResult}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INDIVIDUAL RANKING VIEW */}
        {showIndividualRanking && (
          <div className="bg-white border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-medium text-slate-900 mb-6">
              Individual Ranking – All Phases
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-16 text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
                      Place
                    </th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
                      Participant
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
                      Squad
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
                      Phase 1
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
                      Phase 2
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-slate-500">
                      Phase 3
                    </th>
                    <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-slate-900 bg-slate-50">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getIndividualRankingData().map((member, index) => (
                    <tr
                      key={member.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm font-medium ${
                            index === 0
                              ? 'text-amber-600'
                              : index === 1
                              ? 'text-slate-500'
                              : index === 2
                              ? 'text-orange-600'
                              : 'text-slate-400'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-900">{shortenName(member.name)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-medium text-slate-600">
                          {member.teamName.replace('Squad ', 'S')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{member.phase1}/15</td>
                      <td className="py-3 px-4 text-center">{member.phase2}/15</td>
                      <td className="py-3 px-4 text-center">{member.phase3}/15</td>
                      <td className="py-3 px-4 text-center bg-slate-50">
                        <span className="font-semibold text-slate-900">{member.total}/45</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN MODAL */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-900">Admin access</h3>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Enter admin code to enable editing. Without admin mode, fields are view-only.
              </p>
              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <input
                  type="password"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  placeholder="Admin code"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-sm font-medium rounded bg-slate-900 text-white hover:bg-slate-800"
                >
                  Confirm
                </button>
              </form>
              {isAdmin && (
                <p className="text-[11px] text-emerald-600">
                  Admin mode is active – you can edit numbers.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
