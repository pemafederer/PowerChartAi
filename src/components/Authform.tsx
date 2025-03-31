import { useState } from "react";
import { supabase } from "./SupabaseClient";
import { TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        setLoading(true);
        setMessage("");

        const { error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        setLoading(false);

        if (error) {
            setMessage(`❌ ${error.message}`);
        } else {
            setMessage(isLogin ? "✅ Logged in!" : "✅ Signed up! Please check your email.");
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"

            padding={4}
            mt={8}
            sx={{
                maxWidth: 360,
                mx: "auto",
                border:"1px black solid",
                borderRadius: 2,
                boxShadow: 1,
                backgroundColor: "fff",
        }}
        >
            <Typography variant="h5" gutterBottom>
                {isLogin ? "Login" : "Registrieren"}
            </Typography>

            <TextField
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />

            <TextField
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
            />

            {message && (
                <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mt: 2, width: '100%' }}>
                    {message}
                </Alert>
            )}

            <Box display="flex" justifyContent="space-between" width="100%" mt={3}>
                <Button
                    variant="contained"
                    onClick={handleAuth}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={22} color="inherit" /> : isLogin ? "Login" : "Sign Up"}
                </Button>

                <Button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Registrieren" : "Zurück zu Login"}
                </Button>
            </Box>
        </Box>
    );
}
