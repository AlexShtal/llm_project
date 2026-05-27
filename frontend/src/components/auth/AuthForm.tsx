import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function AuthForm() {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">LLM Chat</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Войдите в свой аккаунт"
            : "Создайте новый аккаунт"}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="youremail@email.com"
            />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ваше имя"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading
              ? "Загрузка..."
              : mode === "login"
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>

        <div className="auth-toggle">
          <span>
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="auth-toggle-button"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}
