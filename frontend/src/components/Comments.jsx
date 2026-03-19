import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export function Comments({ cardId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (cardId) {
      loadComments();
    }
  }, [cardId]);
  
  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments?card_id=eq.${cardId}&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );
      const data = await res.json();
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ 
          card_id: cardId, 
          content: newComment.trim(),
          author: 'User'
        })
      });
      
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  return (
    <div className="comments" style={{ marginTop: '1rem' }}>
      <h4 style={{ 
        margin: '0 0 0.75rem 0', 
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        💬 Comments ({comments.length})
      </h4>
      
      <div className="comments-list" style={{
        maxHeight: '200px',
        overflowY: 'auto',
        marginBottom: '0.75rem'
      }}>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No comments yet
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
                  {comment.author || 'Anonymous'}
                </span>
                <span>
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea 
          value={newComment} 
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            minHeight: '60px',
            resize: 'vertical'
          }}
        />
      </div>
      <button 
        onClick={addComment}
        disabled={!newComment.trim()}
        className="btn btn-secondary"
        style={{ marginTop: '0.5rem', width: '100%' }}
      >
        Add Comment
      </button>
    </div>
  );
}
