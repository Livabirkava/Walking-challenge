import React, { useState, useEffect } from 'react';
import { Calendar, Users, Edit2 } from 'lucide-react';

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
    const savedData = localStorage.getItem('habitTrackerData');
    if (savedData) {
      try {
        setTeams(JSON.parse(savedData));
        return;
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }

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
        name,
        habits: {
          phase1: 0,
          phase2: 0,
          phase3: 0
        }
      }))
    }));

    setTeams(teamsWithMembers);
  }, []);

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
    const totalPossible = team.members.length * 15;

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
            {/* ... THE REST OF YOUR JSX STAYS EXACTLY AS YOU HAD IT ... */}
          </div>
        </div>

        {/* The rest of your component JSX */}
        {/* (I’ve cut here only to keep the message shorter. 
            You can paste your entire original HabitTracker JSX body here,
            starting from the calendar, header, phase selector, TOP 3, individual ranking, etc.) */}
      </div>
    </div>
  );
}
