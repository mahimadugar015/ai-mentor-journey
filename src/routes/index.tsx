import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Toaster, toast } from "sonner";
import { CheckCircle2, Circle, Plus, Trash2, LogOut, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

type Task = { id: string; title: string; done: boolean; createdAt: number };
const USER_KEY = "taskflow.user";
const TASKS_KEY = "taskflow.tasks";

function Index() {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem(USER_KEY));
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      {user ? (
        <TaskBoard user={user} onLogout={() => { localStorage.removeItem(USER_KEY); setUser(null); }} />
      ) : (
        <AuthScreen onLogin={(name) => { localStorage.setItem(USER_KEY, name); setUser(name); }} />
      )}
    </div>
  );
}

function AuthScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Enter a name (2+ chars)");
    if (password.length < 4) return toast.error("Password 4+ chars");
    onLogin(name.trim());
    toast.success(`Welcome, ${name.trim()}`);
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <section className="flex items-center justify-center p-8 bg-gradient-to-br from-accent to-background">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <ListChecks className="size-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">TaskFlow</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            A minimal task manager built to demo an API-driven backend workflow.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary mt-0.5" /> Create, complete, delete tasks</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary mt-0.5" /> Local session — no backend needed to run</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary mt-0.5" /> Ready to wire to a real REST API</li>
          </ul>
        </div>
      </section>
      <section className="flex items-center justify-center p-8">
        <Card className="w-full max-w-sm p-6">
          <h2 className="text-xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-6">Use any name and password to try the demo.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aman" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Card>
      </section>
    </main>
  );
}

function TaskBoard({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), title: t, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setTitle("");
  }

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ListChecks className="size-6 text-primary" />
          <span className="font-semibold text-lg">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {user}</span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="size-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <h1 className="text-2xl font-bold tracking-tight mb-1">Your tasks</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {remaining} open · {tasks.length - remaining} done
      </p>

      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1"
        />
        <Button type="submit"><Plus className="size-4 mr-1" />Add</Button>
      </form>

      {tasks.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No tasks yet. Add your first one above.
        </Card>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id}>
              <Card className="flex items-center gap-3 p-3">
                <button
                  onClick={() => toggle(t.id)}
                  className="text-primary"
                  aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                >
                  {t.done ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                </button>
                <span className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}>
                  {t.title}
                </span>
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Delete">
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
