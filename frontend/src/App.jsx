import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { addDays, subDays, format } from 'date-fns';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import BarChartIcon from '@mui/icons-material/BarChart';

function Navbar({ username, onLogOpen, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'primary.main', borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ flexWrap: 'wrap', px: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
          📝 Daily Logbook
        </Typography>
        {isMobile && username && <IconButton color="inherit" edge="end"><MenuIcon /></IconButton>}
        {!isMobile && username && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', ml: 1 }}>
            <Button color="secondary" variant="outlined" startIcon={<AddIcon />} onClick={onLogOpen} sx={{ ml: 1, fontWeight: 700, borderRadius: 8, borderWidth:2, letterSpacing:'.4px', bgcolor: 'background.paper' }}>Log</Button>
            <Typography variant="subtitle1" sx={{ maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ml: 1 }}>{username}</Typography>
            <Button color="secondary" variant="outlined" onClick={onLogout} sx={{ ml: 1, borderRadius: 8, bgcolor: 'rgba(255,152,0,0.06)' }}>Logout</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("username", username);
      form.append("password", password);
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        onLogin(data.username);
      } else {
        const data = await res.json();
        setError(data.detail || "Login failed");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 10 }}>
      <Typography variant="h6" gutterBottom>Sign In</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          autoFocus
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </form>
    </Paper>
  );
}

function AddEventForm({ onSuccess, username }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [timeMode, setTimeMode] = useState("now");
  const [timestamp, setTimestamp] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!title) {
      setError("Title is required"); setLoading(false); return;
    }
    if (timeMode === "earlier" && !timestamp) {
      setError("Timestamp is required for earlier events."); setLoading(false); return;
    }
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("note", note);
      form.append("time_mode", timeMode);
      if (timeMode === "earlier") form.append("timestamp", timestamp);
      if (file) form.append("file", file);
      const res = await fetch("http://localhost:8000/events", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 700);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to add event.");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h6" gutterBottom>Add Event</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required margin="normal" />
        <FormControl fullWidth margin="normal">
          <FormLabel>Time</FormLabel>
          <RadioGroup row value={timeMode} onChange={e => setTimeMode(e.target.value)}>
            <FormControlLabel value="now" control={<Radio />} label="Now" />
            <FormControlLabel value="earlier" control={<Radio />} label="Earlier" />
          </RadioGroup>
        </FormControl>
        {timeMode === "earlier" && (
          <TextField
            label="Timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
        )}
        <TextareaAutosize
          minRows={3}
          placeholder="Note (optional)"
          style={{ width: '100%', marginTop: 12, marginBottom: 16 }}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <Button variant="contained" component="label" sx={{ mb: 2 }}>
          Upload Photo
          <input type="file" hidden accept="image/*" onChange={e => setFile(e.target.files[0])}/>
        </Button>
        {file && <Typography variant="body2">Selected: {file.name}</Typography>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Event added!</Alert>}
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Add Event"}
        </Button>
      </form>
    </Paper>
  );
}

const USER_OPTIONS = [
  { label: 'Tanish Bajaj', value: 'Tanish Bajaj' },
  { label: 'Naman Kapoor', value: 'Naman Kapoor' },
  { label: 'Ansh Mangla', value: 'Ansh Mangla' }
];
const AGG_OPTIONS = [
  { label: 'List All', value: '' },
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' }
];

function calculateStreaks(dailyEvents) {
  // Input: [{date: 'YYYY-MM-DD', count: N}, ...]
  // Output: {currentStreak: X, maxStreak: Y}
  if (!dailyEvents || dailyEvents.length === 0 || dailyEvents.every(e => !e.count)) return {currentStreak: 0, maxStreak: 0};
  let streak = 0, maxStreak = 0;
  let currentStreak = 0;
  let prev = null;
  // Use IST for today
  const todayDate = new Date();
  const todayIST = new Date(todayDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const today = format(todayIST, 'yyyy-MM-dd');
  dailyEvents = dailyEvents
    .filter(e => e.count > 0)
    .map(e => e.date)
    .filter(Boolean)
    .sort();
  for (let i = 0; i < dailyEvents.length; ++i) {
    if (i === 0) { streak = 1; }
    else {
      const prevDate = new Date(dailyEvents[i-1]);
      const currDate = new Date(dailyEvents[i]);
      const diff = (currDate - prevDate) / (1000*60*60*24);
      if (diff === 1) streak++;
      else streak = 1;
    }
    if (dailyEvents[i] === today) currentStreak = streak;
    if (streak > maxStreak) maxStreak = streak;
  }
  // If today had no log, currentStreak is 0
  if (!dailyEvents.includes(today)) currentStreak = 0;
  return {currentStreak, maxStreak};
}
function UserProfileCard({ user, heatmapData }) {
  // heatmapData: [{ date, count }]
  const total = heatmapData.reduce((a, b) => a + (b.count || 0), 0);
  // Prepare month stats: { '2025-07': 25, ... }
  const months = {};
  heatmapData.forEach(e => {
    if (!e.date) return;
    const m = e.date.slice(0,7);
    months[m] = (months[m] || 0) + (e.count||0);
  });
  const monthKeys = Object.keys(months).sort();
  const {currentStreak, maxStreak} = calculateStreaks(heatmapData);
  const gradient = 'linear-gradient(90deg,#ff9800 10%,#fd4474 90%)';
  return (
    <Card sx={{
      maxWidth: 560,
      mx: 'auto',
      mt: 4,
      mb: 2,
      boxShadow: '0 3px 16px 0 #ffd98044',
      p: 0,
      borderRadius: 4,
      position: 'relative',
      overflow: 'visible',
      '::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 8,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        background: gradient,
        zIndex: 0
      }
    }}>
      <CardContent sx={{ position:'relative', zIndex: 2, pt:2.8 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:3, mb:2 }}>
          <Avatar sx={{ width: 66, height: 66, fontSize: 30, bgcolor: 'secondary.main', color: '#fff', boxShadow: '0 1px 14px #fd447233' }}>{user && user[0]}</Avatar>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: '-2px' }}>{user}</Typography>
            <Typography color="text.secondary" variant="body2">Total Logs: <b>{total}</b></Typography>
            <Typography color="text.secondary" variant="body2">Streak: <b>{currentStreak}</b> (max {maxStreak})</Typography>
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 650, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }} color='secondary.main'><BarChartIcon sx={{ fontSize: 20 }}/> By Month:</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
            {monthKeys.length === 0 && (
              <Typography variant='body2' color='text.secondary'>No monthly data yet.</Typography>
            )}
            {monthKeys.map(m => (
              <Box key={m} sx={{ minWidth: 68, textAlign: 'center', py: 1, px: 1.2, borderRadius: 3, bgcolor: 'rgba(255,152,0,0.14)', boxShadow: months[m]>0 ? '0 2px 12px #fd447227' : 'none', fontWeight:700 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{m}</Typography>
                <Typography color='secondary.main' variant="h6" sx={{ fontWeight: 800, mt: '-2px', letterSpacing: '.5px' }}>{months[m]}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function EventHeatmap({ user, heatmapData }) {
  const [range, setRange] = useState({ start: subDays(new Date(), 180), end: new Date() });
  return (
    <Box sx={{my: 4, mx: 'auto', width: { xs: '99vw', md: 660 }, maxWidth: 720, bgcolor: 'background.paper', borderRadius: 3, p: 2, boxShadow: '0 2px 12px 0 #ffefed26', position: 'relative' }}>
      <Typography variant="subtitle1" sx={{ mb: 2, color: '#fc5603', fontWeight: 700, letterSpacing: '.5px' }}>{user}'s Activity</Typography>
      <CalendarHeatmap
        startDate={format(range.start, 'yyyy-MM-dd')}
        endDate={format(range.end, 'yyyy-MM-dd')}
        values={heatmapData}
        classForValue={v => {
          if (!v || !v.count) return 'color-empty';
          if (v.count >= 10) return 'color-github-5';
          if (v.count >= 6) return 'color-github-4';
          if (v.count >= 4) return 'color-github-3';
          if (v.count >= 2) return 'color-github-2';
          return 'color-github-1';
        }}
        tooltipDataAttrs={v => ({
          'data-tip': `${v.date || ''}: ${v.count || 0} log${v.count === 1 ? '' : 's'}`
        })}
        showWeekdayLabels={true}
      />
      <style>{`.color-empty { fill: #ececec;} .color-github-1 { fill: #ffe4bc;} .color-github-2 { fill: #ffc267;} .color-github-3 { fill: #ff9830;} .color-github-4 { fill: #fc5603;} .color-github-5 { fill: #b23400; }`}</style>
    </Box>
  );
}

function EventGrid({ isMobile, refreshFlag, username }) {
  // Use username from props if valid, default to 'Tanish Bajaj'
  const [user, setUser] = useState(USER_OPTIONS.find(o=>o.value===username)?.value || 'Tanish Bajaj');
  const [agg, setAgg] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    let url = `http://localhost:8000/events?`;
    if (user) url += `user=${user}&`;
    if (agg) url += `agg=${agg}`;
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, [user, agg, refreshFlag]);

  // Heatmap: daily aggregation
  useEffect(() => {
    fetch(`http://localhost:8000/events?agg=daily&user=${user}`, { credentials: 'include' })
      .then(res => res.json())
      .then(groups => {
        const map = (groups || []).map(g => ({
          date: g.date,
          count: g.count
        }));
        setHeatmapData(map);
      });
  }, [user, refreshFlag]);

  // Flat card grid
  const renderCards = evs => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {evs.map((evt, idx) => (
        <Fade in timeout={400+(idx*60)} key={evt.created_at + evt.username + idx}>
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={evt.created_at + evt.username + idx}>
            <Card sx={{ height: '100%', ':hover': { boxShadow: 12 } }}>
              {evt.photo && (
                <CardMedia
                  component="img"
                  height="160"
                  image={`http://localhost:8000${evt.photo}`}
                  alt="event"
                  sx={{ width: 1, objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h6">{evt.title}</Typography>
                <Typography gutterBottom color="text.secondary" variant="body2">
                  <b>{evt.username}</b> &ndash; {new Date(evt.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{evt.note}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Fade>
      ))}
    </Grid>
  );

  let main;
  if (loading) {
    main = <div style={{textAlign:'center',marginTop:40}}>Loading events...</div>;
  } else if (error) {
    main = <Alert severity="error">{error}</Alert>;
  } else if (!events || events.length === 0) {
    main = <Typography sx={{mt:4}} align="center">No events found.</Typography>;
  } else if (agg === 'daily') {
    main = events.map(group => (
      <Box key={group.date || group.month} sx={{mb:4}}>
        <Typography variant="h5">{group.date} ({group.count})</Typography>
        {renderCards(group.events || [])}
      </Box>
    ));
  } else if (agg === 'monthly') {
    main = events.map(group => (
      <Box key={group.month || group.date} sx={{mb:4}}>
        <Typography variant="h5">{group.month} ({group.count})</Typography>
        {renderCards(group.events || [])}
      </Box>
    ));
  } else {
    main = renderCards(events);
  }

  return (
    <Box>
      <UserProfileCard user={user} heatmapData={heatmapData} />
      <EventHeatmap user={user} heatmapData={heatmapData} />
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }} direction={isMobile ? 'column' : 'row'}>
        <Grid item xs={12} sm={6} md={3} lg={2} xl={2}>
          <InputLabel>User Filter</InputLabel>
          <Select
            fullWidth size="small" value={user}
            onChange={e => setUser(e.target.value)}>
            {USER_OPTIONS.map(o => <MenuItem value={o.value} key={o.value}>{o.label}</MenuItem>)}
          </Select>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2} xl={2}>
          <InputLabel>Aggregation</InputLabel>
          <Select
            fullWidth size="small" value={agg}
            onChange={e => setAgg(e.target.value)}>
            {AGG_OPTIONS.map(o => <MenuItem value={o.value} key={o.value}>{o.label}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
      {main}
    </Box>
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#292929',      // Dark text
    },
    secondary: {
      main: '#ff9800',      // Bold orange accent
      contrastText: '#fff',
    },
    background: {
      default: '#faf8f6',
      paper: '#fff',
    },
    text: {
      primary: '#151515',
      secondary: '#666',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 500 },
  }
});

function App() {
  const [page, setPage] = useState("login"); // 'login', 'grid', 'add'
  const [username, setUsername] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // On first mount, check for session
    fetch("http://localhost:8000/me", {
      method: "GET",
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setUsername(data.username);
        setPage("grid");
        setAuthChecked(true);
      })
      .catch(() => {
        setUsername("");
        setPage("login");
        setAuthChecked(true);
      });
  }, []);

  const handleLogin = (user) => {
    setUsername(user);
    setPage("grid");
  };
  const handleAddEvent = () => setLogModalOpen(true);
  const handleLogModalClose = () => setLogModalOpen(false);
  const handleAddSuccess = () => {
    setLogModalOpen(false);
    setRefreshFlag(f => f+1);
  };
  const handleViewGrid = () => setPage("grid");
  const handleLogout = async () => {
    await fetch("http://localhost:8000/logout", {
      method: "POST",
      credentials: "include"
    });
    setUsername("");
    setPage("login");
  };

  if (!authChecked) return <div style={{textAlign:'center', marginTop:80}}>Checking session...</div>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Navbar username={username} onLogOpen={handleAddEvent} onLogout={handleLogout} />
        <Dialog open={logModalOpen} onClose={handleLogModalClose} maxWidth="sm" fullWidth PaperProps={{sx:{borderRadius:5,p:0}}}>
          <DialogContent sx={{p:0, bgcolor:'#fff'}}>
            <AddEventForm onSuccess={handleAddSuccess} username={username} />
          </DialogContent>
        </Dialog>
      <Container maxWidth={false} disableGutters sx={{ px: 0, width: '100vw', minHeight: '100vh', mt: isMobile ? 2 : 4 }}>
        {page === "login" && !username && <LoginForm onLogin={handleLogin} />}
        {username && page === "grid" && (
          <Box>
              <EventGrid isMobile={isMobile} refreshFlag={refreshFlag} username={username} />
          </Box>
        )}
      </Container>
    </Box>
    </ThemeProvider>
  );
}

export default App;
