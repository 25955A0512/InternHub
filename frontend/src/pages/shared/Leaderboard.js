import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../utils/api';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(r => setData(r.data.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={20} style={{ color: '#F59E0B' }} />;
    if (rank === 2) return <Medal size={20} style={{ color: '#94A3B8' }} />;
    if (rank === 3) return <Award size={20} style={{ color: '#CD7F32' }} />;
    return <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-muted)' }}>#{rank}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#4F46E5';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Leaderboard</h1>
          <p className="page-subtitle">Top performing interns ranked by evaluation scores</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {data.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '28px', padding: '24px' }}>
          {/* 2nd Place */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '160px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #94A3B8, #64748B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: 'white', fontWeight: '800', fontSize: '18px' }}>
              {data[1]?.full_name?.[0]}
            </div>
            <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>{data[1]?.full_name}</p>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#94A3B8' }}>{data[1]?.total_score}</p>
            <div style={{ height: '80px', background: 'linear-gradient(180deg, #E2E8F0, #CBD5E1)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={28} style={{ color: '#94A3B8' }} />
            </div>
          </div>

          {/* 1st Place */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '180px' }}>
            <div style={{ width: '68px', height: '68px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: 'white', fontWeight: '800', fontSize: '22px', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}>
              {data[0]?.full_name?.[0]}
            </div>
            <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>{data[0]?.full_name}</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>{data[0]?.total_score}</p>
            <div style={{ height: '110px', background: 'linear-gradient(180deg, #FEF3C7, #FDE68A)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={32} style={{ color: '#F59E0B' }} />
            </div>
          </div>

          {/* 3rd Place */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '160px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #CD7F32, #B8733A)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: 'white', fontWeight: '800', fontSize: '16px' }}>
              {data[2]?.full_name?.[0]}
            </div>
            <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>{data[2]?.full_name}</p>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#CD7F32' }}>{data[2]?.total_score}</p>
            <div style={{ height: '60px', background: 'linear-gradient(180deg, #FED7AA, #FDBA74)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} style={{ color: '#CD7F32' }} />
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="section-header">
          <span className="section-title">All Rankings</span>
          <span className="badge badge-blue">{data.length} Interns</span>
        </div>
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Trophy size={24} /></div>
            <p>No evaluations yet</p>
            <span>Leaderboard will appear after mentors evaluate interns</span>
          </div>
        ) : (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Rank', 'Intern', 'College', 'Score', 'Attendance', 'Tasks', 'Quality'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="table-row" style={{ borderTop: '1px solid var(--border-light)', background: i === 0 ? '#FFFBEB' : i === 1 ? '#F8FAFC' : i === 2 ? '#FFF7ED' : 'white' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                        {getRankIcon(parseInt(item.rank))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ width: '34px', height: '34px', background: `linear-gradient(135deg, var(--primary), var(--secondary))`, color: 'white', fontSize: '13px' }}>
                          {item.full_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-primary)' }}>{item.full_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.role_applied}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{item.college}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: getScoreColor(item.total_score) }}>{item.total_score}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: '600', color: getScoreColor(item.attendance_score) }}>{item.attendance_score}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: '600', color: getScoreColor(item.task_score) }}>{item.task_score}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: '600', color: getScoreColor(item.quality_score) }}>{item.quality_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;