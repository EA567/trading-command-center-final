import { Goal, NotificationItem, Task } from "@/types";
import { todayISO } from "./format";

export function buildNotifications(goals: Goal[], tasks: Task[]): NotificationItem[] {
  const items: NotificationItem[] = [];
  const now = Date.now();

  // Tasks due today, not done
  tasks
    .filter((t) => !t.done && t.dueDate === todayISO())
    .forEach((t) => {
      items.push({
        id: `task-${t.id}`,
        type: "task",
        title: `Task due today: ${t.title}`,
        message: t.category,
        time: t.dueDate as string,
        severity: "info",
      });
    });

  // Goal / challenge close to deadline or close to target
  goals
    .filter((g) => g.deadline)
    .forEach((g) => {
      const daysLeft = Math.ceil((new Date(g.deadline as string).getTime() - now) / 86400000);
      if (daysLeft >= 0 && daysLeft <= 7) {
        items.push({
          id: `goal-${g.id}`,
          type: g.type === "challenge" ? "challenge" : "goal",
          title: `${g.title} — ${daysLeft}d left`,
          message: `${g.current}/${g.target}${g.unit}`,
          time: g.deadline as string,
          severity: daysLeft <= 2 ? "critical" : "warning",
        });
      }
    });

  return items.sort((a, b) => (a.time < b.time ? 1 : -1));
}
