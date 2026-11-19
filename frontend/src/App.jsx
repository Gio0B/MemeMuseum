import { useEffect, useState } from 'react';

function App() {
  const [memeOfTheDay, setMemeOfTheDay] = useState(null);
  const [memes, setMemes] = useState([]);
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('date_desc');

  // AUTENTICAZIONE
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // STATI PER EFFETTI VISIVI E INTERFACCIA
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState(null); 
  const [myVotes, setMyVotes] = useState({}); 

  // UPLOAD
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  // COMMENTI (mappa meme.id -> array di commenti)
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState({});

  const loadMemes = () => {
    let url = `/api/memes?page=${page}&sort=${sort}`;
    if (tag) url += `&tag=${tag}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setMemes(data.memes || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetch('/api/meme-of-the-day')
      .then(res => res.json())
      .then(data => setMemeOfTheDay(data.memeOfTheDay))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    loadMemes();
  }, [page, tag, sort]);

  const handleVote = async (memeId, type) => {
  if (!user) return alert("Devi essere loggato per votare!");

  try {
    const res = await fetch(`/api/memes/${memeId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Errore durante il salvataggio del voto");
    }

    // Aggiorna lo stato del voto dell'utente
    setMyVotes(prev => {
      const newVotes = { ...prev };

      if (data.removed) {
        delete newVotes[memeId];
      } else {
        newVotes[memeId] = data.type;
      }

      return newVotes;
    });

    // Recupera i punteggi aggiornati dal database
    loadMemes();

  } catch (err) {
    console.error(err);
    alert("Impossibile aggiornare il voto. Riprova.");
  }
};

  const loadComments = (memeId) => {
    fetch(`/api/memes/${memeId}/comments`)
      .then(res => res.json())
      .then(data => {
        setCommentsMap(prev => ({ ...prev, [memeId]: data.comments || [] }));
      })
      .catch(err => console.error(err));
  };

  const handleAddComment = async (e, memeId) => {
    e.preventDefault();
    if (!user) return alert("Devi essere loggato per commentare!");
    
    const text = newCommentText[memeId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/memes/${memeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        setNewCommentText(prev => ({ ...prev, [memeId]: '' }));
        loadComments(memeId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId, memeId) => {
    if (!window.confirm("Vuoi davvero eliminare questo commento?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadComments(memeId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeme = async (memeId) => {
    if (!window.confirm("Sei sicuro di voler cancellare questo meme?")) return;
    try {
      const res = await fetch(`/api/memes/${memeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadMemes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isRegistering) {
        alert("Registrazione completata!");
        setIsRegistering(false);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) { setAuthError(err.message); }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '15px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* SEZIONE REGOLE CSS MEDIA QUERY (PC, Tablet e Mobile) */}
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .meme-gallery {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .meme-gallery {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .meme-gallery {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER PRINCIPALE */}
      <header style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '1px' }}>🏛️ MEMEMUSEUM</h1>
        <p style={{ margin: '5px 0 0 0', color: '#667', fontSize: '1rem' }}>La galleria d'arte digitale dedicata alla cultura dei meme</p>
      </header>

      {/* PANNELLO ARTISTA & FORM CARICAMENTO */}
      {user ? (
        <div className="dashboard-grid">
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'fit-content' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#333' }}>Pannello Artista</h3>
              <p style={{ fontSize: '1.1rem', margin: '10px 0' }}>Bentornato, <br /><strong style={{ fontSize: '1.3rem', color: '#007bff' }}>{user.username}</strong>!</p>
            </div>
            <button onClick={() => { localStorage.clear(); setUser(null); setToken(''); setMyVotes({}); }} style={{ padding: '10px', width: '100%', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '15px', fontWeight: 'bold' }}>Scollegati / Logout</button>
          </div>

          <section style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px', boxSizing: 'border-box' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.5rem', color: '#0056b3' }}>📤 Condividi un nuovo Meme nel Museo</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const data = new FormData();
              data.append('title', uploadTitle); data.append('tags', uploadTags); data.append('image', uploadFile);
              const res = await fetch('/api/memes', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
              if (res.ok) { setUploadTitle(''); setUploadTags(''); setUploadFile(null); e.target.reset(); loadMemes(); setUploadMessage('✅ Meme pubblicato con successo!'); }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Titolo dell'opera:</label>
                <input type="text" placeholder="Es: Quando compila al primo colpo" value={uploadTitle} style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setUploadTitle(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Tag associati (separati da virgola):</label>
                <input type="text" placeholder="Es: programmazione, nerd, gaming" value={uploadTags} style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setUploadTags(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Seleziona il file d'immagine:</label>
                <input type="file" accept="image/*" style={{ width: '100%', background: '#fff', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setUploadFile(e.target.files[0])} required />
              </div>
              <button type="submit" style={{ padding: '12px', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', marginTop: '5px' }}>Pubblica Meme nel Museo</button>
            </form>
            {uploadMessage && <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#28a745' }}>{uploadMessage}</p>}
          </section>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', maxWidth: '450px', boxSizing: 'border-box' }}>
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', textAlign: 'center' }}>{isRegistering ? 'Crea un nuovo account' : 'Accedi al Museo'}</h3>
              {isRegistering && <input type="text" placeholder="Scegli uno Username" required style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, username: e.target.value})} />}
              <input type="email" placeholder="Inserisci la tua Email" required style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="password" placeholder="Inserisci la Password" required style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem' }}>{isRegistering ? 'Registrati ora' : 'Accedi ed Entra'}</button>
              {authError && <p style={{ color: 'red', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>{authError}</p>}
              <span 
                onClick={() => setIsRegistering(!isRegistering)} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                style={{ 
                  fontSize: '0.85rem', 
                  color: isActive ? '#004085' : (isHovered ? '#0056b3' : '#007bff'), 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  marginTop: '10px',
                  display: 'block',
                  transition: 'color 0.1s ease',
                  textDecoration: isHovered ? 'underline' : 'none'
                }}
              >
                {isRegistering ? 'Hai già un account artistico? Accedi' : 'Nuovo nel museo? Registrati qui'}
              </span>
            </form>
          </div>
        </div>
      )}

      {/* MEME DEL GIORNO */}
      {memeOfTheDay && (
        <section style={{ background: '#f0f2f5', padding: '15px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center', boxSizing: 'border-box' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.5rem', color: '#000'}}>⭐️ Meme del Giorno ⭐️</h2>
          <h3 style={{ fontSize: '1.2rem' }}>{memeOfTheDay.title}</h3>
          <img 
            src={memeOfTheDay.image_path} 
            alt="Meme del giorno" 
            onClick={() => setSelectedMeme(memeOfTheDay)} 
            style={{width: '100%', height: 'auto', maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '5px', cursor: 'zoom-in' }} 
          />
          <p style={{ margin: '10px 0 0 0' }}>Caricato da: <strong>{memeOfTheDay.username || 'Anonimo'}</strong></p>
        </section>
      )}

      {/* FILTRI DI RICERCA */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        <input type="text" placeholder="Filtra per tag..." value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} style={{ padding: '10px', flex: '1 1 200px', boxSizing: 'border-box' }} />
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} style={{ padding: '10px', flex: '1 1 150px', boxSizing: 'border-box' }}>
          <option value="date_desc">Più recenti</option>
          <option value="date_asc">Più vecchi</option>
          <option value="votes_desc">Più votati</option>
        </select>
      </section>

      {/* GALLERIA CON STRUTTURA A GRIGLIA RE-RESPONSIVA */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Galleria</h2>
        {memes.length === 0 ? <p>Nessun meme trovato.</p> : (
          <div className="meme-gallery">
            {memes.map(meme => (
              <div key={meme.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff', boxSizing: 'border-box' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={meme.title}>{meme.title}</h3>
                  
                  {/* Altezza fissa del box immagine */}
                  <div style={{ width: '100%', height: '220px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa', borderRadius: '4px' }}>
                    <img 
                      src={meme.image_path} 
                      alt={meme.title} 
                      onClick={() => setSelectedMeme(meme)} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }} 
                    />
                  </div>

                  <p style={{ color: '#555', margin: '10px 0', fontSize: '0.85rem' }}>Da: <strong>{meme.username || 'Anonimo'}</strong></p>
                  
                  {/* VOTI */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                    <button 
                      onClick={() => handleVote(meme.id, 1)} 
                      style={{ 
                        padding: '6px 12px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontSize: '0.85rem',
                        background: myVotes[meme.id] === 1 ? '#28a745' : '#d4edda', 
                        color: myVotes[meme.id] === 1 ? '#fff' : '#000',
                        fontWeight: myVotes[meme.id] === 1 ? 'bold' : 'normal',
                        boxShadow: myVotes[meme.id] === 1 ? '0 0 8px rgba(40, 167, 69, 0.6)' : 'none',
                        transition: 'all 0.2s ease'
                      }}>
                      👍
                    </button>
                    
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{meme.score}</span>
                    
                    <button 
                      onClick={() => handleVote(meme.id, -1)} 
                      style={{ 
                        padding: '6px 12px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontSize: '0.85rem',
                        background: myVotes[meme.id] === -1 ? '#dc3545' : '#f8d7da', 
                        color: myVotes[meme.id] === -1 ? '#fff' : '#000',
                        fontWeight: myVotes[meme.id] === -1 ? 'bold' : 'normal',
                        boxShadow: myVotes[meme.id] === -1 ? '0 0 8px rgba(220, 53, 69, 0.6)' : 'none',
                        transition: 'all 0.2s ease'
                      }}>
                      👎
                    </button>
                  </div>
                </div>

                {/* SEZIONE COMMENTI */}
                <div>
                  <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '10px', borderRadius: '6px', marginTop: '10px', boxSizing: 'border-box' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}>💬 Commenti</h4>
                    <button onClick={() => loadComments(meme.id)} style={{ padding: '3px 5px', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '8px', width: '100%' }}>Mostra Commenti</button>
                    
                    <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '5px' }}>
                      {commentsMap[meme.id]?.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '5px 0', fontSize: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '3px', gap: '5px' }}>
                          <p style={{ margin: 0, wordBreak: 'break-word' }}>
                            <strong>{c.username}:</strong> {c.text}
                          </p>
                          {user && user.id === c.user_id && (
                            <button onClick={() => handleDeleteComment(c.id, meme.id)} style={{ background: 'transparent', color: '#dc3545', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0', flexShrink: 0 }}>❌</button>
                          )}
                        </div>
                      ))}
                    </div>

                    {user && (
                      <form onSubmit={(e) => handleAddComment(e, meme.id)} style={{ display: 'flex', gap: '3px' }}>
                        <input type="text" placeholder="Commenta..." value={newCommentText[meme.id] || ''} onChange={e => setNewCommentText({ ...newCommentText, [meme.id]: e.target.value })} style={{ flex: 1, padding: '5px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                        <button type="submit" style={{ padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>➡️</button>
                      </form>
                    )}
                  </div>

                  {user && user.id === meme.user_id && (
                    <button onClick={() => handleDeleteMeme(meme.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', width: '100%', fontSize: '0.85rem' }}>🗑️ Rimuovi Meme</button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* PAGINAZIONE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginTop: '20px', marginBottom: '20px' }}>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ padding: '12px 20px', flex: 1, cursor: 'pointer' }}>Precedente</button>
        <span style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>Pag {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={memes.length < 9} style={{ padding: '12px 20px', flex: 1, cursor: 'pointer' }}>Successiva</button>
      </div>

      {/* MODALE PER IMMAGINE INGRANDITA */}
      {selectedMeme && (
        <div 
          onClick={() => setSelectedMeme(null)} 
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', 
            zIndex: 9999,
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={selectedMeme.image_path} 
            alt={selectedMeme.title} 
            style={{ 
              maxHeight: '85vh', 
              maxWidth: '90vw', 
              objectFit: 'contain', 
              borderRadius: '8px', 
              boxShadow: '0 0 20px rgba(0,0,0,0.8)' 
            }} 
          />
          <p style={{ color: '#fff', marginTop: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {selectedMeme.title}
          </p>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Clicca ovunque per chiudere</span>
        </div>
      )}

    </div>
  );
}

export default App;