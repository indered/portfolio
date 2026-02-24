import { Router } from 'express';

const router = Router();

// ============================================================
// MUSIC INTEGRATION - Placeholder Mode
// ============================================================
// TODO: Real YouTube Music / ytmusic-api integration
// 1. Install ytmusic-api: npm install ytmusic-api
// 2. Initialize the API client:
//    import { YTMusic } from 'ytmusic-api';
//    const ytmusic = new YTMusic();
//    await ytmusic.initialize();
// 3. Fetch real playlist data:
//    const playlist = await ytmusic.getPlaylist(playlistId);
// 4. Consider caching with a TTL (playlist data doesn't change often)
// ============================================================

// Placeholder data matching MUSIC_PLAYLIST from frontend constants
const PLACEHOLDER_PLAYLIST = {
  name: "Mahesh's Quantum Playlist",
  subtitle: 'Frequencies that fuel the multiverse',
  tracks: [
    { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50' },
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
    { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23' },
    { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '3:59' },
    { title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '3:35' },
    { title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '3:18' },
    { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3', duration: '2:21' },
    { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47' },
  ],
};

// GET /api/music/playlist - Return placeholder playlist
router.get('/playlist', (req, res) => {
  // TODO: Replace with real ytmusic-api call
  // const playlist = await ytmusic.getPlaylist(PLAYLIST_ID);
  res.json({
    source: 'placeholder',
    ...PLACEHOLDER_PLAYLIST,
  });
});

export default router;
