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
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

function Navbar({ username, onAddEvent, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <AppBar position="static">
      <Toolbar sx={{ flexWrap: 'wrap', px: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, minWidth: 110, fontWeight: 600, fontSize: { xs: 19, sm: 22 }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Daily Logbook
        </Typography>
        {isMobile && username && <IconButton color="inherit" edge="end"><MenuIcon /></IconButton>}
        {!isMobile && username && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button color="inherit" onClick={onAddEvent} sx={{ mr: 1, flexShrink: 0 }}>Add Event</Button>
            <Typography variant="subtitle1" sx={{ maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1 }}>{username}</Typography>
            <Button color="inherit" onClick={onLogout} sx={{ ml: 1, flexShrink: 0 }}>
              Logout
            </Button>
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
  { label: 'All', value: '' },
  { label: 'alice', value: 'alice' },
  { label: 'bob', value: 'bob' }
];
const AGG_OPTIONS = [
  { label: 'List All', value: '' },
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' }
];

function EventGrid({ isMobile }) {
  const [user, setUser] = useState('');
  const [agg, setAgg] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [user, agg]);

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
                  <b>{evt.username}</b> &ndash; {new Date(evt.created_at).toLocaleString()}
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

function App() {
  const [page, setPage] = useState("login"); // 'login', 'grid', 'add'
  const [username, setUsername] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
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
  const handleAddEvent = () => setPage("add");
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
    <Box>
      <Navbar username={username} onAddEvent={handleAddEvent} onLogout={handleLogout} />
      <Container maxWidth={false} disableGutters sx={{ px: 0, width: '100vw', minHeight: '100vh', mt: isMobile ? 2 : 4 }}>
        {page === "login" && !username && <LoginForm onLogin={handleLogin} />}
        {username && page === "add" && (
          <Box>
            <Button variant="outlined" onClick={handleViewGrid} sx={{ mb: isMobile ? 2 : 0 }} fullWidth={isMobile}>
              Back
            </Button>
            <AddEventForm onSuccess={handleViewGrid} username={username} />
          </Box>
        )}
        {username && page === "grid" && (
          <Box>
            <Grid container spacing={2} direction={isMobile ? "column" : "row"} alignItems={isMobile ? "stretch" : "center"} sx={{mb: isMobile ? 1 : 3}}>
              <Grid item xs={12} sm={6} md={3} lg={2} xl={2}>
                <Button variant="outlined" onClick={handleAddEvent} fullWidth={isMobile}>
                  Add Event
                </Button>
              </Grid>
            </Grid>
            <EventGrid isMobile={isMobile} />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
